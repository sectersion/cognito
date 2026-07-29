import {
  FiGlobe, FiCompass, FiSettings, FiSliders, FiFolder, FiMusic,
  FiImage, FiFilm, FiMessageSquare, FiMail, FiCalendar, FiClock,
  FiMapPin, FiCamera, FiBook, FiTerminal, FiCode, FiDatabase,
  FiLock, FiUser, FiSearch, FiDownload, FiUpload, FiTrash2,
  FiStar, FiHeart, FiBell, FiShield, FiWifi, FiBattery,
  FiMonitor, FiSmartphone, FiTablet, FiLayers, FiBox, FiGrid,
  FiPlay, FiPause, FiSkipBack, FiSkipForward
} from "react-icons/fi";

const iconMap = {
  compass: FiCompass,
  globe: FiGlobe,
  settings: FiSettings,
  sliders: FiSliders,
  folder: FiFolder,
  music: FiMusic,
  image: FiImage,
  film: FiFilm,
  message: FiMessageSquare,
  mail: FiMail,
  calendar: FiCalendar,
  clock: FiClock,
  map: FiMapPin,
  camera: FiCamera,
  book: FiBook,
  terminal: FiTerminal,
  code: FiCode,
  database: FiDatabase,
  lock: FiLock,
  user: FiUser,
  search: FiSearch,
  download: FiDownload,
  upload: FiUpload,
  trash: FiTrash2,
  star: FiStar,
  heart: FiHeart,
  bell: FiBell,
  shield: FiShield,
  wifi: FiWifi,
  battery: FiBattery,
  monitor: FiMonitor,
  smartphone: FiSmartphone,
  tablet: FiTablet,
  layers: FiLayers,
  box: FiBox,
  grid: FiGrid,
  play: FiPlay,
  pause: FiPause,
  skipBack: FiSkipBack,
  skipForward: FiSkipForward,
};

export default function AppIcon({ name, size = 24, style }) {
  const Icon = iconMap[name] || FiBox;
  return <Icon size={size} style={{ display: "block", ...style }} />;
}
