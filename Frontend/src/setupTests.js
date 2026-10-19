

import '@testing-library/jest-dom';

if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:mock-preview";
}
if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = () => {};
}
