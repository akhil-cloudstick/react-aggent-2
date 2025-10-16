export interface PlaceHolderImage {
  id: string;
  imageUrl: string;
  description: string;
  imageHint?: string;
}

export const PlaceHolderImages: PlaceHolderImage[] = [
  {
    id: 'subtask1',
    imageUrl: 'https://via.placeholder.com/500x300?text=Screenshot+1',
    description: 'Screenshot 1',
    imageHint: 'Main window screenshot',
  },
  {
    id: 'subtask2',
    imageUrl: 'https://via.placeholder.com/500x300?text=Screenshot+2',
    description: 'Screenshot 2',
    imageHint: 'Secondary window screenshot',
  },
  // add more mock screenshots as needed
];
