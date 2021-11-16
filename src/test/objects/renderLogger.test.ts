import { RenderLogger } from "../../objects/RenderLogger";

const testMessageSuccess = "Compilation successful";
const testMessageError = "Compilation failed";
const testMessageWarning = "Compilation warning";

let renderLogger: RenderLogger;
describe("Render logger tests", () => {
  beforeEach(() => {
    renderLogger = new RenderLogger();
  });

  it("Should add messages and retrieve messages correctly", () => {
    renderLogger.logMessage(testMessageSuccess);

    expect(renderLogger.getMessages()).toEqual(testMessageSuccess);
  });

  it("Should append messages together in the output", () => {
    renderLogger.logMessage(testMessageWarning);
    renderLogger.logMessage(testMessageError);

    expect(renderLogger.getMessages()).toEqual(
      `${testMessageWarning}\n\r${testMessageError}`
    );
  });
});
