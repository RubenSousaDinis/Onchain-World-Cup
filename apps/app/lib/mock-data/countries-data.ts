export interface Country {
  code: string // ISO 3166-1 alpha-2
  name: string
  flag: string // Emoji
  region: string
}

// This will be replaced with contract data later
export const countries: Country[] = [
  { code: "AR", name: "Argentina", flag: "🇦🇷", region: "CONMEBOL" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", region: "CONMEBOL" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾", region: "CONMEBOL" },
  { code: "CO", name: "Colombia", flag: "🇨🇴", region: "CONMEBOL" },
  { code: "CL", name: "Chile", flag: "🇨🇱", region: "CONMEBOL" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨", region: "CONMEBOL" },
  { code: "PE", name: "Peru", flag: "🇵🇪", region: "CONMEBOL" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾", region: "CONMEBOL" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪", region: "CONMEBOL" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴", region: "CONMEBOL" },

  { code: "FR", name: "France", flag: "🇫🇷", region: "UEFA" },
  { code: "DE", name: "Germany", flag: "🇩🇪", region: "UEFA" },
  { code: "ES", name: "Spain", flag: "🇪🇸", region: "UEFA" },
  { code: "GB-ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", region: "UEFA" },
  { code: "IT", name: "Italy", flag: "🇮🇹", region: "UEFA" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", region: "UEFA" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", region: "UEFA" },
  { code: "BE", name: "Belgium", flag: "🇧🇪", region: "UEFA" },
  { code: "HR", name: "Croatia", flag: "🇭🇷", region: "UEFA" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", region: "UEFA" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", region: "UEFA" },
  { code: "PL", name: "Poland", flag: "🇵🇱", region: "UEFA" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦", region: "UEFA" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", region: "UEFA" },
  { code: "AT", name: "Austria", flag: "🇦🇹", region: "UEFA" },
  { code: "RS", name: "Serbia", flag: "🇷🇸", region: "UEFA" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", region: "UEFA" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿", region: "UEFA" },
  { code: "RO", name: "Romania", flag: "🇷🇴", region: "UEFA" },
  { code: "GB-SCT", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", region: "UEFA" },
  { code: "NO", name: "Norway", flag: "🇳🇴", region: "UEFA" },
  { code: "GB-WLS", name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", region: "UEFA" },
  { code: "IE", name: "Republic of Ireland", flag: "🇮🇪", region: "UEFA" },

  { code: "MX", name: "Mexico", flag: "🇲🇽", region: "CONCACAF" },
  { code: "US", name: "United States", flag: "🇺🇸", region: "CONCACAF" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷", region: "CONCACAF" },
  { code: "CA", name: "Canada", flag: "🇨🇦", region: "CONCACAF" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲", region: "CONCACAF" },
  { code: "PA", name: "Panama", flag: "🇵🇦", region: "CONCACAF" },
  { code: "HN", name: "Honduras", flag: "🇭🇳", region: "CONCACAF" },

  { code: "NG", name: "Nigeria", flag: "🇳🇬", region: "CAF" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", region: "CAF" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", region: "CAF" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", region: "CAF" },
  { code: "TN", name: "Tunisia", flag: "🇹🇳", region: "CAF" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", region: "CAF" },
  { code: "CI", name: "Ivory Coast", flag: "🇨🇮", region: "CAF" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", region: "CAF" },
  { code: "DZ", name: "Algeria", flag: "🇩🇿", region: "CAF" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", region: "CAF" },

  { code: "JP", name: "Japan", flag: "🇯🇵", region: "AFC" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", region: "AFC" },
  { code: "IR", name: "Iran", flag: "🇮🇷", region: "AFC" },
  { code: "AU", name: "Australia", flag: "🇦🇺", region: "AFC" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", region: "AFC" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", region: "AFC" },
  { code: "IQ", name: "Iraq", flag: "🇮🇶", region: "AFC" },
  { code: "AE", name: "UAE", flag: "🇦🇪", region: "AFC" },
]
