import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Wifi, Sparkles, UtensilsCrossed } from 'lucide-react';
import { TableItem } from '../types/salon.types';

export type CardLayoutMode = 'grid_a4' | 'stand_10x15' | 'tent_fold';

export interface TableQrCardPrintSheetProps {
  tables: TableItem[];
  venueName: string;
  venueSlug: string;
  venueLogo?: string | null;
  deliveryBaseUrl: string;
  layoutMode: CardLayoutMode;
  customTitle?: string;
  customSubtitle?: string;
  includeWifi?: boolean;
  wifiSsid?: string;
  wifiPassword?: string;
  accentColor?: string;
  qrColor?: string;
  includeQrLogo?: boolean;
  isPreview?: boolean;
}

export const formatTableBadgeLabel = (label: string): string => {
  const clean = label.replace(/^mesa\s*/i, '').trim();
  return clean ? `Mesa ${clean}` : label;
};

export const TableQrCardPrintSheet: React.FC<TableQrCardPrintSheetProps> = ({
  tables,
  venueName,
  venueSlug,
  venueLogo,
  deliveryBaseUrl,
  layoutMode,
  customTitle = '¡Bienvenidos! Escaneá para ver nuestro menú',
  customSubtitle = 'Apuntá la cámara de tu celular al código QR',
  includeWifi = false,
  wifiSsid = '',
  wifiPassword = '',
  accentColor = '#ea580c',
  qrColor = '#090e17',
  includeQrLogo = true,
  isPreview = false,
}) => {
  const getTableUrl = (table: TableItem) => {
    const base = deliveryBaseUrl.replace(/\/$/, '');
    const cleanSlug = venueSlug || 'menu';
    return `${base}/r/${encodeURIComponent(cleanSlug)}?table=${encodeURIComponent(table.label)}`;
  };

  const renderSingleCard = (table: TableItem, variant: 'grid' | 'stand' | 'tent' = 'grid') => {
    const targetUrl = getTableUrl(table);
    const isStand = variant === 'stand';
    const isTent = variant === 'tent';
    const displayTableLabel = formatTableBadgeLabel(table.label);

    const qrSize = isStand ? 155 : 130;
    const logoSize = isStand ? 36 : 28;

    return (
      <div
        key={table.id}
        className={`relative flex flex-col items-center justify-between bg-white text-slate-900 border-2 rounded-2xl shadow-sm overflow-hidden box-border print:shadow-none ${
          isStand
            ? 'w-[100mm] min-h-[148mm] max-h-[150mm] p-6 mx-auto mb-6 break-after-page border-dashed border-slate-400 print:border-slate-500 print:mb-0'
            : isTent
            ? 'w-[100mm] min-h-[180mm] p-5 mx-auto mb-6 break-after-page border-dashed border-slate-400 print:border-slate-500'
            : 'w-full h-full min-h-[300px] p-5 border-dashed border-slate-400 rounded-xl'
        }`}
        style={{
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        {/* Accent top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-3"
          style={{
            backgroundColor: accentColor,
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        />

        {/* Header: Restaurant Brand & Custom Logo */}
        <div className="flex flex-col items-center text-center mt-2 w-full px-2">
          {venueLogo ? (
            <div className="h-12 w-12 rounded-xl p-1 bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-1.5 overflow-hidden">
              <img
                src={venueLogo}
                alt={venueName}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-black text-base mb-1.5 shadow-sm"
              style={{
                backgroundColor: accentColor,
                color: '#ffffff',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              {venueName.charAt(0).toUpperCase()}
            </div>
          )}
          <h3 className="font-black text-sm sm:text-base tracking-tight text-slate-900 line-clamp-1">
            {venueName}
          </h3>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">
            {customTitle}
          </p>
        </div>

        {/* Table Badge */}
        <div className="my-2.5 flex flex-col items-center">
          <div
            className="px-4 py-1.5 rounded-full font-black text-xs sm:text-sm tracking-wider uppercase shadow-sm flex items-center gap-1.5"
            style={{
              backgroundColor: accentColor,
              color: '#ffffff',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-white" />
            <span style={{ color: '#ffffff' }}>{displayTableLabel}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold mt-1">
            Capacidad: {table.capacity} comensales
          </span>
        </div>

        {/* Personalized QR Code Container */}
        <div
          className="p-3 bg-white rounded-2xl border-2 flex flex-col items-center shadow-sm"
          style={{
            borderColor: accentColor,
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <div className="relative flex items-center justify-center">
            <QRCodeSVG
              value={targetUrl}
              size={qrSize}
              level="H"
              fgColor={qrColor}
              bgColor="#ffffff"
              includeMargin={false}
              imageSettings={
                includeQrLogo && venueLogo
                  ? {
                      src: venueLogo,
                      height: logoSize,
                      width: logoSize,
                      excavate: true,
                    }
                  : undefined
              }
            />
          </div>
          <p className="text-[10px] font-bold text-slate-700 text-center mt-2 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 inline" style={{ color: accentColor }} />
            <span>{customSubtitle}</span>
          </p>
        </div>

        {/* Wi-Fi & Footer Section */}
        <div className="w-full mt-2.5 pt-2 border-t border-slate-200 flex flex-col items-center text-center text-[10px] text-slate-600 space-y-1">
          {includeWifi && (wifiSsid || wifiPassword) ? (
            <div
              className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 w-full flex items-center justify-center gap-2 text-[10px] text-slate-800"
              style={{
                backgroundColor: '#f1f5f9',
                borderColor: '#cbd5e1',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <Wifi className="w-3 h-3 text-slate-700 shrink-0" />
              <div className="flex flex-wrap items-center justify-center gap-x-2">
                {wifiSsid && (
                  <span>
                    Red: <strong>{wifiSsid}</strong>
                  </span>
                )}
                {wifiPassword && (
                  <span>
                    Clave: <strong>{wifiPassword}</strong>
                  </span>
                )}
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between w-full text-[9px] text-slate-500 px-1 pt-0.5">
            <span className="truncate max-w-[140px] font-mono">{targetUrl.replace(/^https?:\/\//, '')}</span>
            <span className="font-semibold text-slate-600">Zogui.cloud</span>
          </div>
        </div>

        {/* Cutting guide hints for stand & grid */}
        {!isPreview && (
          <div className="absolute top-1 right-2 text-[8px] text-slate-400 font-mono select-none">
            {isStand ? '✂ Recorte 10x15 cm' : '✂ recortar'}
          </div>
        )}
      </div>
    );
  };

  if (tables.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
        No hay mesas seleccionadas para generar tarjetas.
      </div>
    );
  }

  // Render by layout mode
  if (layoutMode === 'stand_10x15') {
    return (
      <div className="w-full flex flex-col items-center">
        {tables.map((table) => (
          <div
            key={table.id}
            className="w-full flex justify-center py-4 break-after-page print:py-0 print:m-0"
            style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}
          >
            {renderSingleCard(table, 'stand')}
          </div>
        ))}
      </div>
    );
  }

  if (layoutMode === 'tent_fold') {
    return (
      <div className="w-full flex flex-col items-center">
        {tables.map((table) => (
          <div
            key={table.id}
            className="w-[100mm] bg-white p-2 mb-8 border border-dashed border-slate-400 rounded-2xl break-after-page print:mb-0 print:border-none"
            style={{
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            {/* Front Face */}
            {renderSingleCard(table, 'grid')}

            {/* Fold Divider line */}
            <div className="my-3 py-1 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono select-none border-t border-b border-dashed border-slate-300">
              <span>▲ Plegar hacia arriba aquí / Fold here ▲</span>
            </div>

            {/* Back Face */}
            {renderSingleCard(table, 'grid')}
          </div>
        ))}
      </div>
    );
  }

  // Default: Grid A4 (2 columns x 2 rows per A4 sheet)
  const chunkSize = 4;
  const pages: TableItem[][] = [];
  for (let i = 0; i < tables.length; i += chunkSize) {
    pages.push(tables.slice(i, i + chunkSize));
  }

  return (
    <div className="w-full space-y-6 print:space-y-0">
      {pages.map((pageTables, pageIndex) => (
        <div
          key={`page-${pageIndex}`}
          className="w-full bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:p-0 print:border-none print:shadow-none break-after-page mb-6 print:mb-0"
          style={{
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
            WebkitPrintColorAdjust: 'exact',
            printColorAdjust: 'exact',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pageTables.map((table) => renderSingleCard(table, 'grid'))}
          </div>
          {pages.length > 1 && (
            <div className="no-print mt-3 text-right text-[11px] text-slate-400 font-medium">
              Hoja {pageIndex + 1} de {pages.length}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
