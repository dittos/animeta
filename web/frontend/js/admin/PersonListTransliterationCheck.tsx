import React, { useEffect, useState } from "react";
import { Button, Container, Form, Navbar, Table } from "react-bootstrap";
import { useRouteMatch } from "react-router";
import { Link } from "react-router-dom";
import { API } from './ApiClient';

type TransliterationCheckItem = {
  personId: string;
  name: string;
  newName?: string;
  recommendedTransliteration: string | null;
  count: number;
};

function PersonListTransliterationCheck() {
  const match = useRouteMatch<{ period: string }>();
  const [result, setResult] = useState<TransliterationCheckItem[]>([]);

  const period = match.params.period;

  useEffect(() => {
    reload();
  }, [period]);

  return <div>
    <h1>Transliteration Check: {match.params.period}</h1>

    <Table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>New name</th>
          <th>Count</th>
        </tr>
      </thead>
      <tbody>
        {result.map(it => (
          <tr key={it.personId} style={/[A-Za-z]/.test(it.name) ? {} : {opacity: 0.5}}>
            <td>{it.personId}</td>
            <td><Link to={`/people/${it.personId}`} tabIndex={-1}>{it.name}</Link></td>
            <td>
              <input type="text" value={it.newName ?? ''} onChange={e => updateName(it.personId, e.target.value)} />
              {it.recommendedTransliteration && it.newName !== it.recommendedTransliteration && (
                <button style={{marginLeft: '10px'}} onClick={() => updateName(it.personId, it.recommendedTransliteration!)}>
                  {it.recommendedTransliteration}
                </button>
              )}
            </td>
            <td>{it.count}</td>
          </tr>
        ))}
      </tbody>
    </Table>

    {/* space for bottom navbar */}
    <div style={{height: '50px'}} />

    <Navbar fixed="bottom" style={{ padding: '10px 0' }} bg="light">
      <Container>
        <Form inline>
          <Button variant="primary" onClick={save}>Save</Button>
          ({result.reduce((acc, it) => acc + (it.newName ? 1 : 0), 0)} changes)
        </Form>
      </Container>
    </Navbar>
  </div>;

  async function reload() {
    setResult(await API.call('/api/admin/v1/PersonListTransliterationCheck/', {period}))
  }

  function updateName(personId: string, newName: string) {
    setResult(result.map(it => it.personId === personId ? ({ ...it, newName }) : it))
  }

  async function save() {
    try {
      await API.call('/api/admin/v1/PersonListTransliterationCheck/bulkRename', result.filter(it => it.newName).map(it => ({
        id: it.personId,
        name: it.newName!
      })))
      reload()
      alert('Saved')
    } catch (e) {
      console.error(e)
      alert('Error: ' + e)
    }
  }
}

export default PersonListTransliterationCheck;