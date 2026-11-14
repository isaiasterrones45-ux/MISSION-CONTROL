// Error con código HTTP y código de máquina para que Godot/Angular puedan reaccionar.
class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
module.exports = HttpError;
