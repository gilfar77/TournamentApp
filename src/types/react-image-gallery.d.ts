declare module 'react-image-gallery' {
  export interface ReactImageGalleryItem {
    original: string;
    thumbnail?: string;
    originalClass?: string;
    thumbnailClass?: string;
    originalAlt?: string;
    thumbnailAlt?: string;
    originalTitle?: string;
    thumbnailTitle?: string;
    description?: string;
    thumbnailLabel?: string;
    originalHeight?: string;
    originalWidth?: string;
    thumbnailHeight?: string;
    thumbnailWidth?: string;
    originalId?: string;
    thumbnailId?: string;
    renderItem?: (item: ReactImageGalleryItem) => React.ReactNode;
    renderThumbInner?: (item: ReactImageGalleryItem) => React.ReactNode;
    imageSet?: ReactImageGalleryImageSet[];
    srcSet?: string;
    sizes?: string;
    bulletClass?: string;
    customData?: any;
  }

  export interface ReactImageGalleryImageSet {
    srcSet: string;
    media: string;
  }

  export interface ReactImageGalleryProps {
    items: ReactImageGalleryItem[];
    showNav?: boolean;
    autoPlay?: boolean;
    lazyLoad?: boolean;
    infinite?: boolean;
    showIndex?: boolean;
    showBullets?: boolean;
    showThumbnails?: boolean;
    showPlayButton?: boolean;
    showFullscreenButton?: boolean;
    slideOnThumbnailOver?: boolean;
    disableThumbnailScroll?: boolean;
    disableKeyDown?: boolean;
    disableSwipe?: boolean;
    useBrowserFullscreen?: boolean;
    preventDefaultTouchmoveEvent?: boolean;
    onErrorImageURL?: string;
    indexSeparator?: string;
    slideDuration?: number;
    swipingTransitionDuration?: number;
    slideInterval?: number;
    startIndex?: number;
    thumbnailPosition?: 'top' | 'right' | 'bottom' | 'left';
    useWindowKeyDown?: boolean;
    additionalClass?: string;
    renderCustomControls?: () => React.ReactNode;
    renderLeftNav?: (onClick: () => void, disabled: boolean) => React.ReactNode;
    renderRightNav?: (onClick: () => void, disabled: boolean) => React.ReactNode;
    renderPlayPauseButton?: (onClick: () => void, isPlaying: boolean) => React.ReactNode;
    renderFullscreenButton?: (onClick: () => void, isFullscreen: boolean) => React.ReactNode;
    renderItem?: (item: ReactImageGalleryItem) => React.ReactNode;
    renderThumbInner?: (item: ReactImageGalleryItem) => React.ReactNode;
    onClick?: (event: React.MouseEvent) => void;
    onImageLoad?: (event: React.SyntheticEvent) => void;
    onImageError?: (event: React.SyntheticEvent) => void;
    onTouchMove?: (event: React.TouchEvent) => void;
    onTouchEnd?: (event: React.TouchEvent) => void;
    onTouchStart?: (event: React.TouchEvent) => void;
    onMouseOver?: (event: React.MouseEvent) => void;
    onMouseLeave?: (event: React.MouseEvent) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onSlide?: (currentIndex: number) => void;
    onScreenChange?: (fullScreenEnabled: boolean) => void;
    onFullscreenClick?: () => void;
    onThumbnailClick?: (event: React.MouseEvent, index: number) => void;
    onBeforeSlide?: (currentIndex: number, nextIndex: number) => void;
    stopPropagation?: boolean;
  }

  export default class ReactImageGallery extends React.Component<ReactImageGalleryProps> {
    play: () => void;
    pause: () => void;
    fullScreen: () => void;
    exitFullScreen: () => void;
    slideToIndex: (index: number) => void;
    getCurrentIndex: () => number;
  }
} 