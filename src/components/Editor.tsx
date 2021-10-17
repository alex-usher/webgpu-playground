interface EditorProps {
    value: string
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}

const Editor = ({value, onChange} : EditorProps) => (
    <textarea className="editor" value={value} onChange={onChange} />
)

export default Editor