type IconImgProps = { size?: number; className?: string };

function iconOf(src: string, alt: string) {
  return function Icon({ size = 18, className }: IconImgProps) {
    return (
      <img
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={className}
        style={{ display: "block", objectFit: "contain", width: size, height: size }}
      />
    );
  };
}

/* Sidebar — Main Menu */
export const SidebarHomeIcon = iconOf("/images/01e604a2682937d00a477d34110d0f024003e00f.png", "Home");
export const SidebarDashboardIcon = iconOf("/images/c670d936aeabaad5d1e90ba761dc81797abb64f4.png", "Dashboard");
export const SidebarInventoryIcon = iconOf("/images/e70c68099ae7bbb7a7b309df759e2c830d65c640.png", "Inventory");
export const SidebarSalesIcon = iconOf("/images/37a399ce24e8e07f62f960dba798fc3324a937b2.png", "Sales");
export const SidebarPurchaseIcon = iconOf("/images/b6e697b7fbf00f1fa2c0b0aba521ef439678299d.png", "Purchase");
export const SidebarRegistrationIcon = iconOf("/images/d453f98c2244c746396606e7e78b492d10ae30af.png", "Registration");
export const SidebarExportIcon = iconOf("/images/239849049d76ffb9bac161f8423a2967da2da55a.png", "Export");

/* Sidebar — Help & Setting */
export const SidebarHelpIcon = iconOf("/images/a6964171b6df8bc3a25854eccde01d10aa66f964.png", "Help & Center");
export const SidebarSettingsIcon = iconOf("/images/4f1fc8cdb1e69965dbbd4d2d330b92f3bc04055d.png", "Settings");
export const SidebarLogoutIcon = iconOf("/images/343e2e284dda3c39bb011a7e46da909dac194ef4.png", "Logout");

/* Home — feature cards */
export const CardInventoryIcon = iconOf("/images/6b03d818b4d5c245807beed2c970c5c5c3525400.png", "Inventory Management");
export const CardSalesIcon = iconOf("/images/5c7d61de61c2d326ed03149051338d18aaa21a55.png", "Sales Management");
export const CardPurchaseIcon = iconOf("/images/f5433b77d029da3ecabf4aa4b223936fb41db55a.png", "Purchase Management");
export const CardRegistrationIcon = iconOf("/images/e4aa348d6779e959bff884f8b67c7152cb281419.png", "Process of Registration");
export const CardExportIcon = iconOf("/images/e70c68099ae7bbb7a7b309df759e2c830d65c640.png", "Export of Data");
export const CardInsightsIcon = iconOf("/images/72dbf07c40819a18e4d613b642ddd78ce3d3d8f1.png", "Management Insights");

/* Home — help bar */
export const InfoIcon = iconOf("/images/a6964171b6df8bc3a25854eccde01d10aa66f964.png", "Info");

/* Home — version bar (white icon, use on a dark background) */
export const VersionIcon = iconOf("/images/68cceeab04f018309024408591c743430af416bb.png", "Version");
