export interface SharingFirmanInput {
  judul: string;
  nama_pembagi: string;
  tanggal_sharing: string;
  isi_ringkasan: string;
  ayat_referensi: string;
}
export interface SharingFirman extends SharingFirmanInput {
  id: string;
  dibuat_pada: string;
  diperbarui_pada: string;
}
export interface SharingFirmanWithToken extends SharingFirman {
  creator_token: string;
}
export type CreateSharingFirmanDTO = SharingFirmanInput & {
  creator_token: string;
};
export type UpdateSharingFirmanDTO = Partial<SharingFirmanInput> & {
  creator_token: string;
};
export type SharingFirmanListItem = Omit<SharingFirman, "isi_ringkasan"> & {
  cuplikan: string;
};
export interface SharingFirmanQueryParams {
  q?: string;
  pembagi?: string;
  page?: number;
  limit?: number;
}
export interface SharingFirmanListResponse {
  data: SharingFirmanListItem[];
  total: number;
  page: number;
  limit: number;
  pembagi: string[];
}
export type FieldErrors = Partial<Record<keyof SharingFirmanInput, string>>;
