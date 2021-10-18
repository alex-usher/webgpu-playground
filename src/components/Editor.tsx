import '../assets/editor.css'

interface EditorProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const Editor = ({value, onChange} : EditorProps) => (
    <div className="editor-container"> 
        <textarea className="editor" value={value} onChange={onChange}  />
    </div>
)

export default Editor