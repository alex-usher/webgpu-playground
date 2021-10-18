import { TextareaAutosize } from '@mui/material';
import '../assets/editor.css'

interface EditorProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const Editor = ({value, onChange} : EditorProps) => (
    <div className="editor-container"> 
        <TextareaAutosize className="editor" value={value} onChange={onChange} style={{width: "100%", height: "100%"}} />
    </div>
)

export default Editor