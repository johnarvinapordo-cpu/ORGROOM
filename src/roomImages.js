/**
 * ORGROOM room image registry.
 *
 * Keys are the exact facilities.id values returned by /api/facilities.
 * Add a real photograph later by mapping that ID to its public image path.
 *
 * Example:
 * '12': '/room-images/room-12.jpg'
 *
 * Optional per-room placeholder overrides can also be added before a photo
 * is available. Unmapped rooms receive a type-appropriate campus illustration.
 */

export const ROOM_IMAGE_BY_ID = Object.freeze({
  // 'DATABASE_ROOM_ID': '/room-images/actual-room-photo.jpg',
});

export const ROOM_PLACEHOLDER_BY_ID = Object.freeze({
  // 'DATABASE_ROOM_ID': '/room-placeholders/computer-lab.svg',
});

const PLACEHOLDERS = Object.freeze({
  classroom: '/room-placeholders/classroom.svg',
  computerLab: '/room-placeholders/computer-lab.svg',
  scienceLab: '/room-placeholders/science-lab.svg',
  lectureRoom: '/room-placeholders/lecture-room.svg',
  facultyRoom: '/room-placeholders/faculty-room.svg',
  trainingRoom: '/room-placeholders/training-room.svg',
  multipurpose: '/room-placeholders/multipurpose.svg',
  general: '/room-placeholders/general-facility.svg',
});

function placeholderForRoom(room = {}) {
  const identity = `${room.type || ''} ${room.name || ''} ${room.description || ''}`.toLowerCase();

  if (/computer|comlab|ict|information technology/.test(identity)) {
    return PLACEHOLDERS.computerLab;
  }

  if (/science|chemistry|physics|biology|pharmacy|laboratory|\blab\b/.test(identity)) {
    return PLACEHOLDERS.scienceLab;
  }

  if (/lecture|auditorium|seminar/.test(identity)) {
    return PLACEHOLDERS.lectureRoom;
  }

  if (/faculty|staff|office/.test(identity)) {
    return PLACEHOLDERS.facultyRoom;
  }

  if (/training|caregiving|vocational|bookkeeping|practical|work area|nc ii/.test(identity)) {
    return PLACEHOLDERS.trainingRoom;
  }

  if (/court|activity area|dining|multipurpose|multi-purpose|church|pool/.test(identity)) {
    return PLACEHOLDERS.multipurpose;
  }

  if (/classroom|class room|regular room/.test(identity)) {
    return PLACEHOLDERS.classroom;
  }

  return PLACEHOLDERS.classroom;
}

export function getRoomImage(room = {}) {
  const roomId = String(room.id ?? '').trim();
  const placeholder = ROOM_PLACEHOLDER_BY_ID[roomId] || placeholderForRoom(room);
  // Prefer the image URL saved on the facility record in MySQL.
  // Keep the ID registry as a backward-compatible fallback for older records.
  const databaseImage = String(room.imageUrl || room.image_url || '').trim();
  const realImage = databaseImage || ROOM_IMAGE_BY_ID[roomId];

  return {
    src: realImage || placeholder,
    fallbackSrc: placeholder,
    isPlaceholder: !realImage,
  };
}