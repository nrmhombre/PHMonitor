declare module "leaflet" {
  export interface IconOptions {
    iconUrl?: string;
    iconRetinaUrl?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
    shadowUrl?: string;
    shadowRetinaUrl?: string;
    shadowSize?: [number, number];
    shadowAnchor?: [number, number];
    className?: string;
    html?: string;
  }

  export function icon(options: IconOptions): unknown;
  export function divIcon(options: IconOptions): unknown;
}

declare module "react-leaflet" {
  import { ComponentType, ReactNode } from "react";

  export interface MapContainerProps {
    center?: [number, number];
    zoom?: number;
    className?: string;
    zoomControl?: boolean;
    children?: ReactNode;
  }

  export interface TileLayerProps {
    attribution?: string;
    url: string;
  }

  export interface MarkerProps {
    position: [number, number];
    icon?: unknown;
    children?: ReactNode;
  }

  export interface PopupProps {
    children?: ReactNode;
  }

  export const MapContainer: ComponentType<MapContainerProps>;
  export const TileLayer: ComponentType<TileLayerProps>;
  export const Marker: ComponentType<MarkerProps>;
  export const Popup: ComponentType<PopupProps>;
  export const useMap: () => {
    flyTo: (center: [number, number], zoom: number, options?: { duration: number }) => void;
    setView: (center: [number, number], zoom: number) => void;
  };
}
