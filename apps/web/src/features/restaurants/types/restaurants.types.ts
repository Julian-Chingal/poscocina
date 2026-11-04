export interface VenueItem {
  id: string;
  name: string;
  slug?: string;
  address?: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface CompanyItem {
  id: string;
  legalName: string;
  tradeName: string;
  taxId: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  createdAt: string;
  venues: VenueItem[];
}

export interface CreateCompanyPayload {
  tradeName: string;
  legalName: string;
  taxId: string;
  slug?: string;
  primaryColor?: string;
  phone?: string;
  email?: string;
  address?: string;
  initialVenueName?: string;
  initialVenueAddress?: string;
}
