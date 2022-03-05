import { checkPassword, CheckPasswordResult, makePassword, PBKDF2 } from "./hashers"

test('checkPassword', async () => {
  expect(await checkPassword("test",
                "pbkdf2_sha256$100000$STGJzGsYzTOu$93vfFP97sA+QvEbmkda8OCFneuoa+xlK6CwfTh/+vV0="))
    .toBe(CheckPasswordResult.CORRECT)
})

test('makePassword', async () => {
  expect(await makePassword("test", Buffer.from("STGJzGsYzTOu"), PBKDF2))
    .toBe("pbkdf2_sha256$100000$STGJzGsYzTOu$93vfFP97sA+QvEbmkda8OCFneuoa+xlK6CwfTh/+vV0=")
})
