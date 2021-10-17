import { useState } from 'react'
import Editor from '../components/Editor'

const CodeEditorPage = () => {
    const [code, setCode] = useState("")
    function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
        setCode(e.target.value)
    }

    return (
        <div>
            <Editor value={code} onChange={handleChange} />
        </div>
    )
}

export default CodeEditorPage