'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps'
import { useI18n } from '@/lib/i18n'
import './worldmap.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface City {
  name: string
  nameEn: string
  lat: number
  lng: number
  landmark?: string
}

export interface VisitedCountryData {
  id: string
  countryCode: string
  name: string
  nameEn: string
  color: string
  cities: City[]
  sortOrder: number
}

interface WorldMapProps {
  visitedCountries: VisitedCountryData[]
  selectedCountry: VisitedCountryData | null
  onCountrySelect: (country: VisitedCountryData | null) => void
}

// ISO Alpha-2 to ISO Numeric mapping for Natural Earth data
const COUNTRY_CODE_MAP: Record<string, string> = {
  AF:'004',AL:'008',DZ:'012',AD:'020',AO:'024',AG:'028',AR:'032',AM:'051',AU:'036',AT:'040',
  AZ:'031',BS:'044',BH:'048',BD:'050',BB:'052',BY:'112',BE:'056',BZ:'084',BJ:'204',BT:'064',
  BO:'068',BA:'070',BW:'072',BR:'076',BN:'096',BG:'100',BF:'854',BI:'108',KH:'116',CM:'120',
  CA:'124',CF:'140',TD:'148',CL:'152',CN:'156',CO:'170',KM:'174',CD:'180',CG:'178',CR:'188',
  CI:'384',HR:'191',CU:'192',CY:'196',CZ:'203',DK:'208',DJ:'262',DM:'212',DO:'214',EC:'218',
  EG:'818',SV:'222',GQ:'226',ER:'232',EE:'233',SZ:'748',ET:'231',FJ:'242',FI:'246',FR:'250',
  GA:'266',GM:'270',GE:'268',DE:'276',GH:'288',GR:'300',GD:'308',GT:'320',GN:'324',GW:'624',
  GY:'328',HT:'332',HN:'340',HU:'348',IS:'352',IN:'356',ID:'360',IR:'364',IQ:'368',IE:'372',
  IL:'376',IT:'380',JM:'388',JP:'392',JO:'400',KZ:'398',KE:'404',KI:'296',KP:'408',KR:'410',
  KW:'414',KG:'417',LA:'418',LV:'428',LB:'422',LS:'426',LR:'430',LY:'434',LI:'438',LT:'440',
  LU:'442',MG:'450',MW:'454',MY:'458',MV:'462',ML:'466',MT:'470',MH:'584',MR:'478',MU:'480',
  MX:'484',FM:'583',MD:'498',MC:'492',MN:'496',ME:'499',MA:'504',MZ:'508',MM:'104',NA:'516',
  NR:'520',NP:'524',NL:'528',NZ:'554',NI:'558',NE:'562',NG:'566',MK:'807',NO:'578',OM:'512',
  PK:'586',PW:'585',PA:'591',PG:'598',PY:'600',PE:'604',PH:'608',PL:'616',PT:'620',QA:'634',
  RO:'642',RU:'643',RW:'646',KN:'659',LC:'662',VC:'670',WS:'882',SM:'674',ST:'678',SA:'682',
  SN:'686',RS:'688',SC:'690',SL:'694',SG:'702',SK:'703',SI:'705',SB:'090',SO:'706',ZA:'710',
  SS:'728',ES:'724',LK:'144',SD:'729',SR:'740',SE:'752',CH:'756',SY:'760',TW:'158',TJ:'762',
  TZ:'834',TH:'764',TL:'626',TG:'768',TO:'776',TT:'780',TN:'788',TR:'792',TM:'795',TV:'798',
  UG:'800',UA:'804',AE:'784',GB:'826',US:'840',UY:'858',UZ:'860',VU:'548',VE:'862',VN:'704',
  YE:'887',ZM:'894',ZW:'716',XK:'-99',PS:'275',EH:'732',GL:'304',FK:'238',NC:'540',PR:'630',
  GF:'254',
}

export function WorldMap({ visitedCountries, selectedCountry, onCountrySelect }: WorldMapProps) {
  const { t, locale } = useI18n()
  const [tooltipData, setTooltipData] = useState<{
    country: VisitedCountryData
    x: number
    y: number
  } | null>(null)
  const [mapReady, setMapReady] = useState(false)

  // Trigger entry animation after mount
  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Build a lookup from ISO numeric code to visited country data
  const visitedMap = useMemo(() => {
    const map = new Map<string, VisitedCountryData>()
    visitedCountries.forEach(vc => {
      const numericCode = COUNTRY_CODE_MAP[vc.countryCode]
      if (numericCode) map.set(numericCode, vc)
    })
    return map
  }, [visitedCountries])

  return (
    <div className={`world-map-section ${mapReady ? 'map-entered' : ''}`}>
      <div className="world-map-wrapper">
        <div className="world-map-header">
          <div>
            <div className="world-map-title">{t('map.title')}</div>
            <div className="world-map-hint">{t('map.clickHint')}</div>
          </div>
          <div className="world-map-stats">
            {visitedCountries.length} {t('map.countries')}
          </div>
        </div>

        <div className="world-map-container" id="world-map">
          <ComposableMap
            projectionConfig={{
              rotate: [-10, 0, 0],
              scale: 147,
            }}
            style={{ width: '100%', height: 'auto' }}
          >
            <ZoomableGroup center={[0, 20]} zoom={1}>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const isoNumeric = geo.id
                    const visited = visitedMap.get(isoNumeric)
                    const isSelected = selectedCountry?.countryCode ===
                      Object.entries(COUNTRY_CODE_MAP).find(([, v]) => v === isoNumeric)?.[0]

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        className={`${visited ? 'visited' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => {
                          if (visited) {
                            onCountrySelect(
                              selectedCountry?.id === visited.id ? null : visited
                            )
                          }
                        }}
                        onMouseEnter={(evt) => {
                          if (visited) {
                            const svgRect = (evt.target as Element).closest('svg')?.getBoundingClientRect()
                            if (svgRect) {
                              setTooltipData({
                                country: visited,
                                x: evt.clientX - svgRect.left,
                                y: evt.clientY - svgRect.top,
                              })
                            }
                          }
                        }}
                        onMouseLeave={() => setTooltipData(null)}
                        style={{
                          default: {
                            fill: visited ? visited.color : '#e8e8e4',
                            stroke: '#d0d0cc',
                            strokeWidth: 0.5,
                          },
                          hover: {
                            fill: visited ? visited.color : '#e0e0dc',
                            stroke: visited ? '#888' : '#d0d0cc',
                            strokeWidth: visited ? 1 : 0.5,
                          },
                          pressed: {
                            fill: visited ? visited.color : '#e8e8e4',
                          },
                        }}
                      />
                    )
                  })
                }
              </Geographies>

              {/* City markers for visited countries */}
              {visitedCountries.map(vc =>
                (vc.cities as City[]).filter(c => c.lat && c.lng).map((city, i) => (
                  <Marker key={`${vc.id}-${i}`} coordinates={[city.lng!, city.lat!]}>
                    {/* Pulse ring */}
                    <circle
                      r={6}
                      fill={vc.color}
                      opacity={0.3}
                      className="map-marker-pulse"
                    />
                    {/* Center dot */}
                    <circle
                      r={3}
                      fill={vc.color}
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                    {city.landmark && (
                      <text
                        textAnchor="middle"
                        y={-10}
                        className="map-marker-landmark"
                      >
                        {city.landmark}
                      </text>
                    )}
                  </Marker>
                ))
              )}
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {tooltipData && (
            <div
              className="country-tooltip"
              style={{
                left: tooltipData.x,
                top: tooltipData.y,
              }}
            >
              <div className="country-tooltip-name">
                {locale === 'zh' || locale === 'ja' || locale === 'ko'
                  ? tooltipData.country.name
                  : tooltipData.country.nameEn}
              </div>
              {(tooltipData.country.cities as City[]).length > 0 && (
                <div className="country-tooltip-cities">
                  {(tooltipData.country.cities as City[]).map((c, i) => (
                    <span key={i}>
                      {c.landmark || '📍'}{' '}
                      {locale === 'en' ? c.nameEn : c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
