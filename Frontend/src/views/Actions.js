import { validateFileUrl } from "../app/format.js";
import eyeBlueIcon from "../assets/svg/eye_blue.js";

export default (billUrl) => {
  const isValidFile = !validateFileUrl(billUrl);
  const iconClass = isValidFile ? "" : "icon-disabled";
  return `
    <div class="icon-actions">
      <div id="eye" data-testid="icon-eye" data-bill-url="${billUrl}" class="${iconClass}">${eyeBlueIcon}</div>
    </div>
  `;
};
