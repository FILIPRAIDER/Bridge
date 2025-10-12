/**
 * ====================================
 * TIPOS PARA SISTEMA DE ÁREAS/SUB-EQUIPOS
 * ====================================
 */

export enum AreaRole {
  LEADER = "LEADER",   // Líder del área
  MEMBER = "MEMBER",   // Miembro regular
}

export enum MessageType {
  TEXT = "TEXT",                // Mensaje de texto normal
  FILE = "FILE",                // Archivo compartido
  SYSTEM = "SYSTEM",            // Mensaje del sistema
  ANNOUNCEMENT = "ANNOUNCEMENT", // Anuncio importante
}

export enum AreaNotificationType {
  ASSIGNED_TO_AREA = "ASSIGNED_TO_AREA",       // Te asignaron a un área
  REMOVED_FROM_AREA = "REMOVED_FROM_AREA",     // Te removieron de un área
  NEW_FILE = "NEW_FILE",                       // Nuevo archivo subido
  NEW_MESSAGE = "NEW_MESSAGE",                 // Nuevo mensaje (con @mención)
  AREA_CREATED = "AREA_CREATED",               // Nueva área creada
  AREA_DELETED = "AREA_DELETED",               // Área eliminada
  MEMBER_JOINED = "MEMBER_JOINED",             // Nuevo miembro en el área
  MEMBER_LEFT = "MEMBER_LEFT",                 // Miembro salió del área
}

export interface TeamArea {
  id: string;
  name: string;
  description: string | null;
  color: string | null;       // Código hexadecimal para identificación visual
  icon: string | null;         // Emoji o código de icono
  
  // Relaciones
  teamId: string;
  team?: any; // Team type
  
  areaLeaderId: string | null;
  areaLeader?: AreaUser | null;
  
  members: AreaMember[];
  files?: AreaFile[];
  messages?: AreaMessage[];
  
  // Stats (calculados en backend)
  memberCount?: number;
  fileCount?: number;
  messageCount?: number;
  unreadCount?: number;
  lastActivityAt?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface AreaMember {
  id: string;
  areaId: string;
  userId: string;
  role: AreaRole;
  
  user: AreaUser;
  area?: TeamArea;
  
  assignedAt: string;
  assignedBy: string; // ID del líder que asignó
}

export interface AreaUser {
  id: string;
  name: string | null;
  email: string;
  avatarUrl: string | null;
}

export interface AreaFile {
  id: string;
  areaId: string;
  
  fileName: string;
  fileUrl: string;
  fileSize: number;      // Tamaño en bytes
  fileType: string;      // MIME type
  
  uploadedBy: string;
  uploader: AreaUser;
  
  description: string | null;
  downloads: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface AreaMessage {
  id: string;
  areaId: string;
  userId: string;
  
  content: string;
  type: MessageType;
  
  user: AreaUser;
  
  // Para menciones, archivos adjuntos, etc.
  metadata?: {
    mentions?: string[];      // IDs de usuarios mencionados
    fileId?: string;          // ID del archivo si es tipo FILE
    [key: string]: any;
  } | null;
  
  // Para edición y eliminación
  editedAt: string | null;
  deletedAt: string | null;
  
  createdAt: string;
}

export interface AreaNotification {
  id: string;
  userId: string;
  areaId: string;
  
  type: AreaNotificationType;
  title: string;
  message: string;
  
  read: boolean;
  readAt: string | null;
  
  // Metadata para acciones (ej: link al archivo, mensaje, etc)
  actionUrl: string | null;
  metadata?: {
    [key: string]: any;
  } | null;
  
  createdAt: string;
}

// ====================================
// REQUEST/RESPONSE TYPES
// ====================================

export interface CreateAreaRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  areaLeaderId?: string;
}

export interface UpdateAreaRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  areaLeaderId?: string;
}

export interface AssignMemberRequest {
  userId: string;
  role: AreaRole;
}

export interface SendMessageRequest {
  content: string;
  type: MessageType;
  metadata?: {
    mentions?: string[];
    [key: string]: any;
  };
}

export interface UploadFileRequest {
  file: File;
  description?: string;
}

// ====================================
// API RESPONSE TYPES
// ====================================

export interface AreasListResponse {
  areas: TeamArea[];
}

export interface AreaDetailsResponse {
  area: TeamArea;
}

export interface AreaMembersResponse {
  members: AreaMember[];
}

export interface AreaFilesResponse {
  files: AreaFile[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface AreaMessagesResponse {
  messages: AreaMessage[];
  hasMore: boolean;
}

export interface AreaNotificationsResponse {
  notifications: AreaNotification[];
  unreadCount: number;
}

// ====================================
// WEBSOCKET EVENT TYPES
// ====================================

export interface SocketMessage {
  event: string;
  data: any;
}

export interface NewMessageEvent {
  message: AreaMessage;
}

export interface MessageEditedEvent {
  messageId: string;
  content: string;
  editedAt: string;
}

export interface MessageDeletedEvent {
  messageId: string;
}

export interface UserTypingEvent {
  userId: string;
  userName: string;
}

export interface MemberAssignedEvent {
  member: AreaMember;
}

export interface NewFileEvent {
  file: AreaFile;
}

// ====================================
// UTILITY TYPES
// ====================================

export interface AreaStats {
  totalAreas: number;
  totalMembers: number;
  unassignedMembers: number;
  totalFiles: number;
  totalMessages: number;
}
