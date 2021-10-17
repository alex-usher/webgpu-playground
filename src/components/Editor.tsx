const Editor = (value: string, onChange: () => void) => (
    <textarea className="editor" value={value} onChange={onChange} />
)

export default Editor