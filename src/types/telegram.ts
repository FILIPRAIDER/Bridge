// src/types/telegram.ts

/**
 * Tipos para integración de Telegram con Bridge
 */

// ============================================
// TELEGRAM GROUP
// ============================================

export interface TelegramGroup {
  id: string;
  chatId: string; // ID del chat de Telegram
  chatTitle: string; // Nombre del grupo
  chatType: 'group' | 'supergroup' | 'channel';
  areaId: string;
  teamId: string;
  inviteLink?: string;
  memberCount?: number;
  isActive: boolean;
  linkedBy: string; // userId que vinculó
  linkedAt: string; // ISO timestamp
  createdAt: string;
  updatedAt: string;
}

// ============================================
// TELEGRAM MESSAGE
// ============================================

export interface TelegramMessage {
  id: string;
  messageId: number; // ID de Telegram
  chatId: string;
  fromId: number; // Telegram user ID
  fromUsername?: string;
  fromFirstName?: string;
  fromLastName?: string;
  text: string;
  date: number; // Unix timestamp
  replyToMessageId?: number;
  forwardFromChatId?: string;
  editDate?: number;
  entities?: TelegramMessageEntity[];
}

export interface TelegramMessageEntity {
  type: 'mention' | 'hashtag' | 'bot_command' | 'url' | 'email' | 'bold' | 'italic' | 'code' | 'pre';
  offset: number;
  length: number;
  url?: string;
  user?: {
    id: number;
    username?: string;
    first_name: string;
  };
}

// ============================================
// AREA MESSAGE (EXTENDIDO)
// ============================================

export interface AreaMessage {
  id: string;
  areaId: string;
  userId?: string; // Puede ser undefined si viene de Telegram
  content: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM';
  source: 'web' | 'telegram'; // ⭐ NUEVO
  
  // Info del usuario (web)
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  
  // Info de Telegram (si source === 'telegram')
  telegram?: {
    messageId: number;
    fromId: number;
    fromUsername?: string;
    fromFirstName?: string;
    fromLastName?: string;
  };
  
  // Metadata de archivo
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  
  // Reply
  replyToId?: string;
}

// ============================================
// TELEGRAM MEMBER
// ============================================

export interface TelegramMember {
  id: string; // userId de Bridge
  name: string;
  email: string;
  avatar?: string;
  invited: boolean; // Ya fue invitado por email?
  joinedTelegram: boolean; // Ya se unió al grupo?
  telegramUsername?: string;
  telegramUserId?: number;
}

// ============================================
// API REQUESTS/RESPONSES
// ============================================

export interface LinkTelegramGroupRequest {
  chatId: string;
  areaId: string;
  teamId: string;
  chatTitle: string;
  chatType: 'group' | 'supergroup' | 'channel';
  inviteLink?: string;
}

export interface LinkTelegramGroupResponse {
  success: boolean;
  group: TelegramGroup;
  message: string;
}

export interface SendTelegramInvitesRequest {
  groupId: string;
  memberIds: string[];
  message?: string;
}

export interface SendTelegramInvitesResponse {
  success: boolean;
  invitationsSent: number;
  message: string;
}

// ============================================
// WIZARD STATE
// ============================================

export type TelegramSetupStep = 
  | 'intro'
  | 'create-group'
  | 'add-bot'
  | 'link-code'
  | 'invite-members'
  | 'success';

export interface TelegramSetupState {
  currentStep: TelegramSetupStep;
  areaId: string;
  areaName: string;
  group?: TelegramGroup;
  inviteLink?: string;
  linkCode?: string;
}

// ============================================
// UTILS TYPES
// ============================================

export interface TelegramLinkCode {
  code: string; // Ej: "TG-ABC-123-XYZ"
  chatId: string;
  chatTitle: string;
  expiresAt: string;
}

export interface TelegramInviteData {
  groupName: string;
  inviteLink: string;
  botUsername: string;
  qrCodeUrl?: string;
}
