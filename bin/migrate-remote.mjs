#!/usr/bin/env zx

const $0 = $
$ = (...args) => {
  const promise = $0(...args)
  promise.then(output => {
    if (!output.toString().endsWith('\n')) {
      echo('')
    }
    return output
  })
  return promise
}

const secretName = (await $`kubectl get deployment animeta-backend-ts -o jsonpath='{.spec.template.spec.volumes[?(@.name=="secret")].secret.secretName}'`).stdout

const jobManifest = `
apiVersion: batch/v1
kind: Job
metadata:
  generateName: animeta-migrate-job-
spec:
  backoffLimit: 0
  ttlSecondsAfterFinished: 3600
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: call
          image: ghcr.io/dittos/animeta-backend-ts
          imagePullPolicy: Always
          command: ['node_modules/.bin/typeorm', 'migration:run']
          env:
          - name: NODE_ENV
            value: production
          - name: SENTRY_DSN
            value: "https://deb70af1222e49a98b699584f9819f79@o120476.ingest.sentry.io/6187990"
          - name: GOOGLE_APPLICATION_CREDENTIALS
            value: /app/secrets/google-credentials.json
          - name: ANIMETA_MEDIA_STORAGE_URL
            value: "gs://animeta-static/media/"
          envFrom:
          - secretRef:
              name: ${secretName}
          volumeMounts:
          - mountPath: /app/backend-ts/ormconfig.json
            name: secret
            subPath: backend-ts-ormconfig.json
          - mountPath: /app/secrets
            name: secret
          resources:
            limits:
              memory: "512Mi"
            requests:
              memory: "256Mi"
      volumes:
      - name: secret
        secret:
          secretName: ${secretName}
`

const createJob = $`kubectl create -f - -o jsonpath='{.metadata.name}'`
createJob.stdin.write(jobManifest)
createJob.stdin.end()
const jobName = (await createJob).stdout

const waitJob = async (jobName, conditionPredicate) => {
  for (let i = 0; i < 20; i++) {
    const jobStatus = JSON.parse((await $`kubectl get job ${jobName} -o jsonpath='{.status}'`).stdout)
    let condition = jobStatus?.conditions?.find(it => it.status === 'True' && (it.type === 'Complete' || it.type === 'Failed'))?.type
    if (!condition && (jobStatus.ready ?? 0) > 0) {
      condition = 'Ready'
    }
    if (conditionPredicate(condition)) {
      return condition
    }
    await sleep(3000)
  }
}

await waitJob(jobName, condition => condition != null)
await $`kubectl logs job/${jobName} -f`

const finalCondition = await waitJob(jobName, condition => condition === 'Complete' || condition === 'Failed')
if (finalCondition === 'Complete') {
  echo('Job completed!')
} else {
  throw new Error(`Job failed to complete: ${jobName}`)
}
