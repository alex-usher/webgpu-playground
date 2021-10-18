import '../assets/editor.css'

interface EditorProps {
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const Editor = ({placeholder, value, onChange} : EditorProps) => (
    <div className="editor-container"> 
        <textarea className="editor" value={value} placeholder={placeholder} onChange={onChange}  />
    </div>
)

export default Editor