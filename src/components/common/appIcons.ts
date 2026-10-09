import type { SvgIconProps } from '@mui/material';
import type { ComponentType } from 'react';
import AlbumOutlined from '@mui/icons-material/AlbumOutlined';
import ArticleOutlined from '@mui/icons-material/ArticleOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import AudiotrackOutlined from '@mui/icons-material/AudiotrackOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import BookmarkOutlined from '@mui/icons-material/BookmarkOutlined';
import BrushOutlined from '@mui/icons-material/BrushOutlined';
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined';
import CampaignOutlined from '@mui/icons-material/CampaignOutlined';
import CheckBoxOutlined from '@mui/icons-material/CheckBoxOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import EmojiEventsOutlined from '@mui/icons-material/EmojiEventsOutlined';
import EventOutlined from '@mui/icons-material/EventOutlined';
import FavoriteOutlined from '@mui/icons-material/FavoriteOutlined';
import FlagOutlined from '@mui/icons-material/FlagOutlined';
import FolderOutlined from '@mui/icons-material/FolderOutlined';
import GraphicEqOutlined from '@mui/icons-material/GraphicEqOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import HeadphonesOutlined from '@mui/icons-material/HeadphonesOutlined';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import LanguageOutlined from '@mui/icons-material/LanguageOutlined';
import LibraryMusicOutlined from '@mui/icons-material/LibraryMusicOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import LinkOutlined from '@mui/icons-material/LinkOutlined';
import ListAltOutlined from '@mui/icons-material/ListAltOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import MicOutlined from '@mui/icons-material/MicOutlined';
import MovieOutlined from '@mui/icons-material/MovieOutlined';
import MusicNoteOutlined from '@mui/icons-material/MusicNoteOutlined';
import NotesOutlined from '@mui/icons-material/NotesOutlined';
import PaletteOutlined from '@mui/icons-material/PaletteOutlined';
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined';
import PlaceOutlined from '@mui/icons-material/PlaceOutlined';
import PublicOutlined from '@mui/icons-material/PublicOutlined';
import PushPinOutlined from '@mui/icons-material/PushPinOutlined';
import QueueMusicOutlined from '@mui/icons-material/QueueMusicOutlined';
import RadioOutlined from '@mui/icons-material/RadioOutlined';
import StarOutlined from '@mui/icons-material/StarOutlined';
import VideocamOutlined from '@mui/icons-material/VideocamOutlined';

export type AppIconComponent = ComponentType<SvgIconProps>;

export const APP_ICONS = {
  description: DescriptionOutlined,
  article: ArticleOutlined,
  notes: NotesOutlined,
  musicNote: MusicNoteOutlined,
  album: AlbumOutlined,
  libraryMusic: LibraryMusicOutlined,
  queueMusic: QueueMusicOutlined,
  audiotrack: AudiotrackOutlined,
  graphicEq: GraphicEqOutlined,
  mic: MicOutlined,
  headphones: HeadphonesOutlined,
  radio: RadioOutlined,
  event: EventOutlined,
  calendar: CalendarMonthOutlined,
  place: PlaceOutlined,
  group: GroupOutlined,
  link: LinkOutlined,
  image: ImageOutlined,
  camera: PhotoCameraOutlined,
  video: VideocamOutlined,
  movie: MovieOutlined,
  folder: FolderOutlined,
  attachment: AttachFileOutlined,
  star: StarOutlined,
  favorite: FavoriteOutlined,
  flag: FlagOutlined,
  bookmark: BookmarkOutlined,
  lightbulb: LightbulbOutlined,
  checklist: CheckBoxOutlined,
  list: ListAltOutlined,
  pin: PushPinOutlined,
  campaign: CampaignOutlined,
  home: HomeOutlined,
  info: InfoOutlined,
  sparkle: AutoAwesomeOutlined,
  palette: PaletteOutlined,
  brush: BrushOutlined,
  edit: EditOutlined,
  book: MenuBookOutlined,
  trophy: EmojiEventsOutlined,
  globe: PublicOutlined,
  language: LanguageOutlined,
} as const satisfies Record<string, AppIconComponent>;

export type AppIconId = keyof typeof APP_ICONS;

export const DEFAULT_APP_ICON_ID: AppIconId = 'description';

export const APP_ICON_IDS = Object.keys(APP_ICONS) as AppIconId[];

export function isAppIconId(value: string): value is AppIconId {
  return Object.prototype.hasOwnProperty.call(APP_ICONS, value);
}

export function getAppIcon(id: string | null | undefined): AppIconComponent {
  if (id && isAppIconId(id)) {
    return APP_ICONS[id];
  }
  return APP_ICONS[DEFAULT_APP_ICON_ID];
}

export function appIconLabel(id: string): string {
  return id.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
}
