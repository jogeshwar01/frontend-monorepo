import { countryCodeToFlagEmoji, FALLBACK_FLAG } from './flag-emoji';

// REGIONAL INDICATOR SYMBOLS:
// 🇦
// 🇧
// 🇨
// 🇩
// 🇪
// 🇫
// 🇬
// 🇭
// 🇮
// 🇯
// 🇰
// 🇱
// 🇲
// 🇳
// 🇴
// 🇵
// 🇶
// 🇷
// 🇸
// 🇹
// 🇺
// 🇻
// 🇼
// 🇽
// 🇾
// 🇿

const cases = [
  ['AC', '🇦🇨'],
  ['AD', '🇦🇩'],
  ['AE', '🇦🇪'],
  ['AF', '🇦🇫'],
  ['AG', '🇦🇬'],
  ['AI', '🇦🇮'],
  ['AL', '🇦🇱'],
  ['AM', '🇦🇲'],
  ['AO', '🇦🇴'],
  ['AR', '🇦🇷'],
  ['AS', '🇦🇸'],
  ['AT', '🇦🇹'],
  ['AQ', '🇦🇶'],
  ['AW', '🇦🇼'],
  ['AZ', '🇦🇿'],
  ['BA', '🇧🇦'],
  ['BB', '🇧🇧'],
  ['BD', '🇧🇩'],
  ['BE', '🇧🇪'],
  ['BF', '🇧🇫'],
  ['BG', '🇧🇬'],
  ['BH', '🇧🇭'],
  ['BI', '🇧🇮'],
  ['BJ', '🇧🇯'],
  ['BL', '🇧🇱'],
  ['BM', '🇧🇲'],
  ['BN', '🇧🇳'],
  ['BO', '🇧🇴'],
  ['BR', '🇧🇷'],
  ['BS', '🇧🇸'],
  ['BT', '🇧🇹'],
  ['BQ', '🇧🇶'],
  ['BW', '🇧🇼'],
  ['BY', '🇧🇾'],
  ['BZ', '🇧🇿'],
  ['CA', '🇨🇦'],
  ['CC', '🇨🇨'],
  ['CD', '🇨🇩'],
  ['CF', '🇨🇫'],
  ['CG', '🇨🇬'],
  ['CH', '🇨🇭'],
  ['CI', '🇨🇮'],
  ['CK', '🇨🇰'],
  ['CL', '🇨🇱'],
  ['CM', '🇨🇲'],
  ['CN', '🇨🇳'],
  ['CO', '🇨🇴'],
  ['CP', '🇨🇵'],
  ['CR', '🇨🇷'],
  ['CW', '🇨🇼'],
  ['CY', '🇨🇾'],
  ['CZ', '🇨🇿'],
  ['DE', '🇩🇪'],
  ['DG', '🇩🇬'],
  ['DJ', '🇩🇯'],
  ['DK', '🇩🇰'],
  ['DM', '🇩🇲'],
  ['DO', '🇩🇴'],
  ['DZ', '🇩🇿'],
  ['EA', '🇪🇦'],
  ['EC', '🇪🇨'],
  ['EE', '🇪🇪'],
  ['EG', '🇪🇬'],
  ['EH', '🇪🇭'],
  ['ER', '🇪🇷'],
  ['ES', '🇪🇸'],
  ['ET', '🇪🇹'],
  ['FI', '🇫🇮'],
  ['FJ', '🇫🇯'],
  ['FK', '🇫🇰'],
  ['FM', '🇫🇲'],
  ['FO', '🇫🇴'],
  ['FR', '🇫🇷'],
  ['GA', '🇬🇦'],
  ['GB', '🇬🇧'],
  ['GD', '🇬🇩'],
  ['GE', '🇬🇪'],
  ['GF', '🇬🇫'],
  ['GG', '🇬🇬'],
  ['GH', '🇬🇭'],
  ['GI', '🇬🇮'],
  ['GL', '🇬🇱'],
  ['GM', '🇬🇲'],
  ['GN', '🇬🇳'],
  ['GP', '🇬🇵'],
  ['GR', '🇬🇷'],
  ['GS', '🇬🇸'],
  ['GT', '🇬🇹'],
  ['GQ', '🇬🇶'],
  ['GW', '🇬🇼'],
  ['GY', '🇬🇾'],
  ['HK', '🇭🇰'],
  ['HM', '🇭🇲'],
  ['HN', '🇭🇳'],
  ['HR', '🇭🇷'],
  ['HT', '🇭🇹'],
  ['IC', '🇮🇨'],
  ['ID', '🇮🇩'],
  ['IE', '🇮🇪'],
  ['IL', '🇮🇱'],
  ['IM', '🇮🇲'],
  ['IN', '🇮🇳'],
  ['IO', '🇮🇴'],
  ['IR', '🇮🇷'],
  ['IS', '🇮🇸'],
  ['IT', '🇮🇹'],
  ['IQ', '🇮🇶'],
  ['JE', '🇯🇪'],
  ['JM', '🇯🇲'],
  ['JO', '🇯🇴'],
  ['JP', '🇯🇵'],
  ['KE', '🇰🇪'],
  ['KG', '🇰🇬'],
  ['KH', '🇰🇭'],
  ['KI', '🇰🇮'],
  ['KM', '🇰🇲'],
  ['KN', '🇰🇳'],
  ['KP', '🇰🇵'],
  ['KR', '🇰🇷'],
  ['KW', '🇰🇼'],
  ['KY', '🇰🇾'],
  ['KZ', '🇰🇿'],
  ['LA', '🇱🇦'],
  ['LB', '🇱🇧'],
  ['LC', '🇱🇨'],
  ['LI', '🇱🇮'],
  ['LK', '🇱🇰'],
  ['LR', '🇱🇷'],
  ['LS', '🇱🇸'],
  ['LT', '🇱🇹'],
  ['LY', '🇱🇾'],
  ['MA', '🇲🇦'],
  ['MC', '🇲🇨'],
  ['MD', '🇲🇩'],
  ['ME', '🇲🇪'],
  ['MF', '🇲🇫'],
  ['MG', '🇲🇬'],
  ['MH', '🇲🇭'],
  ['MK', '🇲🇰'],
  ['ML', '🇲🇱'],
  ['MM', '🇲🇲'],
  ['MN', '🇲🇳'],
  ['MO', '🇲🇴'],
  ['MP', '🇲🇵'],
  ['MR', '🇲🇷'],
  ['MS', '🇲🇸'],
  ['MT', '🇲🇹'],
  ['MQ', '🇲🇶'],
  ['MW', '🇲🇼'],
  ['MY', '🇲🇾'],
  ['MZ', '🇲🇿'],
  ['NA', '🇳🇦'],
  ['NC', '🇳🇨'],
  ['NE', '🇳🇪'],
  ['NF', '🇳🇫'],
  ['NG', '🇳🇬'],
  ['NI', '🇳🇮'],
  ['NL', '🇳🇱'],
  ['NO', '🇳🇴'],
  ['NP', '🇳🇵'],
  ['NR', '🇳🇷'],
  ['NZ', '🇳🇿'],
  ['OM', '🇴🇲'],
  ['PA', '🇵🇦'],
  ['PE', '🇵🇪'],
  ['PF', '🇵🇫'],
  ['PG', '🇵🇬'],
  ['PH', '🇵🇭'],
  ['PK', '🇵🇰'],
  ['PL', '🇵🇱'],
  ['PM', '🇵🇲'],
  ['PN', '🇵🇳'],
  ['PR', '🇵🇷'],
  ['PS', '🇵🇸'],
  ['PT', '🇵🇹'],
  ['PW', '🇵🇼'],
  ['PY', '🇵🇾'],
  ['RE', '🇷🇪'],
  ['RO', '🇷🇴'],
  ['RS', '🇷🇸'],
  ['RW', '🇷🇼'],
  ['SA', '🇸🇦'],
  ['SB', '🇸🇧'],
  ['SC', '🇸🇨'],
  ['SD', '🇸🇩'],
  ['SE', '🇸🇪'],
  ['SG', '🇸🇬'],
  ['SH', '🇸🇭'],
  ['SI', '🇸🇮'],
  ['SJ', '🇸🇯'],
  ['SK', '🇸🇰'],
  ['SL', '🇸🇱'],
  ['SM', '🇸🇲'],
  ['SN', '🇸🇳'],
  ['SO', '🇸🇴'],
  ['SR', '🇸🇷'],
  ['SS', '🇸🇸'],
  ['ST', '🇸🇹'],
  ['SY', '🇸🇾'],
  ['SZ', '🇸🇿'],
  ['TA', '🇹🇦'],
  ['TC', '🇹🇨'],
  ['TD', '🇹🇩'],
  ['TF', '🇹🇫'],
  ['TG', '🇹🇬'],
  ['TH', '🇹🇭'],
  ['TJ', '🇹🇯'],
  ['TK', '🇹🇰'],
  ['TL', '🇹🇱'],
  ['TM', '🇹🇲'],
  ['TN', '🇹🇳'],
  ['TO', '🇹🇴'],
  ['TR', '🇹🇷'],
  ['TT', '🇹🇹'],
  ['TW', '🇹🇼'],
  ['TZ', '🇹🇿'],
  ['QA', '🇶🇦'],
  ['VG', '🇻🇬'],
  ['WF', '🇼🇫'],
  ['WS', '🇼🇸'],
  ['YE', '🇾🇪'],
  ['YT', '🇾🇹'],
  ['ZA', '🇿🇦'],
  ['ZM', '🇿🇲'],
  ['ZW', '🇿🇼'],
  // unknown
  ['AA', FALLBACK_FLAG],
  ['XX', FALLBACK_FLAG],
  ['AAA', FALLBACK_FLAG],
];

describe('countryCodeToFlagEmoji', () => {
  it.each(cases)('converts %s to %s', (countryCode, flag) => {
    expect(countryCodeToFlagEmoji(countryCode)).toEqual(flag);
  });
});