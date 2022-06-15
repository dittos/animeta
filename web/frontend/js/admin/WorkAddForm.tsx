import React, { useRef, useState } from "react"
import { Button, Form, FormGroup } from "react-bootstrap"
import { useHistory } from "react-router-dom"
import { API } from "./ApiClient"
import TitleAutosuggest from "./TitleAutosuggest"

export const WorkAddForm: React.FC<{}> = () => {
  const ref = useRef<TitleAutosuggest>(null)
  const history = useHistory()
  const [namuRef, setNamuRef] = useState<string | null>(null)

  function onTitleSelected(item: { id: number }) {
    history.push(`/works/${item.id}`)
    ref.current!.clear()
  }

  function onTitleValueChange(value: string) {
    if (value.startsWith('https://namu.wiki/w/')) {
      const url = new URL(value)
      const page = decodeURIComponent(url.pathname.substring('/w/'.length))
      const anchor = decodeURIComponent(url.hash.substring(1))
      const namuRef = anchor ? `${page}#${anchor}` : page
      
      const title = page.replace(/\/애니메이션$/, '')
      setNamuRef(namuRef)
      ref.current!.setValue(title)
    }
  }
  
  function addWork() {
    const title = ref.current!.getValue().trim()
    API.call('/api/admin/v1/WorkAddForm/createWork', {
      title,
      namuRef,
    }).then(work => {
      history.push(`/works/${work.id}`)
      ref.current!.clear()
      setNamuRef(null)
    })
  }

  return (
    <Form inline className="mr-sm-3">
      <FormGroup className="mr-sm-2" style={{ display: 'block' }}>
        <TitleAutosuggest
          onSelected={onTitleSelected}
          onValueChange={onTitleValueChange}
          ref={ref}
        />
        {namuRef && (
          <Form.Text>
            <Button size="sm" variant="danger" onClick={() => setNamuRef(null)}>&times;</Button>
            <strong>Namuwiki Reference:</strong> {namuRef}
          </Form.Text>
        )}
      </FormGroup>{' '}
      <Button onClick={addWork}>Add work</Button>
    </Form>
  )
}
