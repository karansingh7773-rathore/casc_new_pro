export enum UserRole {
  NONE = 'NONE',
  HOMEOWNER = 'HOMEOWNER',
  POLICE = 'POLICE'
}

export interface CameraNode {
  id: string;
  ownerName: string;
  address: string;
  lat: number;
  lng: number;
  contact: string;
  hasFootage: boolean;
  registeredDate: string;
  isPrivate: boolean; // Privacy mode toggle
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface AccessRequest {
  id: string;
  cameraId: string;
  requestDate: string;
  incidentTime: string;
  reason: string;
  status: RequestStatus;
  videoUrl?: string; // Blob URL for preview
  videoFile?: File; // Actual file for AI
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Incident {
  id: string;
  type: string;
  description: string;
  lat: number;
  lng: number;
  timestamp: string;
  radius: number; // Search radius in meters
}

export interface CommunityAlert {
  id: string;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
}

// Mock Data Types - Centered roughly around San Francisco for demo
// Helper to generate mock cameras around a center point
export const generateMockCameras = (centerLat: number, centerLng: number): CameraNode[] => {
  const owners = ['John Doe', 'Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Chen', 'Sarah Wilson', 'David Brown'];
  const streets = ['Market St', 'Mission St', 'Van Ness', 'Castro St', 'Main St', 'Broadway', 'Park Ave'];

  return Array.from({ length: 15 }, (_, i) => {
    // Random offset within ~2km
    const latOffset = (Math.random() - 0.5) * 0.04;
    const lngOffset = (Math.random() - 0.5) * 0.04;

    return {
      id: `c${Date.now()}-${i}`,
      ownerName: owners[i % owners.length] + (i > 6 ? ` ${i}` : ''),
      address: `${Math.floor(Math.random() * 900) + 100} ${streets[i % streets.length]}`,
      lat: centerLat + latOffset,
      lng: centerLng + lngOffset,
      contact: `555-01${i.toString().padStart(2, '0')}`,
      hasFootage: Math.random() > 0.3,
      registeredDate: '2023-11-15',
      isPrivate: Math.random() > 0.8 // 20% private
    };
  });
};

export const MOCK_CAMERAS: CameraNode[] = generateMockCameras(37.7749, -122.4194);


export const MOCK_INCIDENTS: Incident[] = [
  { id: 'i1', type: 'Theft', description: 'Vehicle break-in reported', lat: 37.7755, lng: -122.4180, timestamp: '10 mins ago', radius: 300 },
  { id: 'i2', type: 'Assault', description: 'Physical altercation in public park', lat: 37.7615, lng: -122.4340, timestamp: '1 hour ago', radius: 500 },
];

export const MOCK_ALERTS: CommunityAlert[] = [
  { id: 'a1', title: 'Suspicious Vehicle', message: 'Blue Sedan with plate ending 456 seen circling blocks near Market St.', severity: 'medium', date: 'Today, 10:30 AM' },
  { id: 'a2', title: 'Package Thief', message: 'Person in red hoodie reported stealing packages in Mission District.', severity: 'low', date: 'Yesterday' },
];

