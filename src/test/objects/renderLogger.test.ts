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
    renderLogger.logMessage(testMessageSuccess, "success");

    expect(renderLogger.getMessages()).toEqual(testMessageSuccess);
  });

  it("Should append messages together in the output", () => {
    renderLogger.logMessage(testMessageWarning, "warning");
    renderLogger.logMessage(testMessageError, "error");

    expect(renderLogger.getMessages()).toEqual(
      `${testMessageWarning}\n\r${testMessageError}`
    );
  });

  it("Empties the messages list on clearLog()", () => {
    renderLogger.logMessage(testMessageSuccess, "success");

    expect(renderLogger.getMessages()).not.toEqual("");

    renderLogger.clearLog();

    expect(renderLogger.getMessages()).toEqual("");
  });
});
