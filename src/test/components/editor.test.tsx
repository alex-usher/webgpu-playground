import {render} from '@testing-library/react'
import Editor from "../../components/Editor"

const testValue = "Test Value"
const renderEditor = () => render(<Editor value={testValue} onChange={() => {}}/>)

describe("Editor Component Tests", () => {
    it("Should initialise the text area with the given value", () => {
        const textarea = renderEditor().container.getElementsByTagName("textarea")[0];

        expect(textarea).toHaveProperty("value", testValue)
    })
})
