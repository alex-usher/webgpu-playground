import { TextareaAutosize } from '@mui/material';
import '../assets/editor.css'

interface EditorProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const Editor = ({value, onChange} : EditorProps) => (
    <div className="editor-container"> 
        <TextareaAutosize className="editor" value={value} onChange={onChange} style={{width: 500, height: 500}} />
    </div>
)

export default Editor