export interface DriveFolder {
  id: string;
  name: string;
  url: string;
}

export interface DriveProjectFolders {
  root: DriveFolder;
  raw: DriveFolder;
  photos: DriveFolder;
  reels: DriveFolder;
  brandFilms: DriveFolder;
  exports: DriveFolder;
  finalDelivery: DriveFolder;
  archive: DriveFolder;
}
