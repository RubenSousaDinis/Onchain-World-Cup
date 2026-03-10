/**
 * Base Builder Code attribution for onchain transaction tracking.
 * https://docs.base.org/base-chain/builder-codes/builder-codes
 *
 * Builder code: bc_iamoxpwj
 *
 * The suffix is ERC-8021 encoded:
 *   concat(utf8(code), length_byte, schema_id_byte, erc_suffix_magic)
 * Schema 0 (no registry), magic = 0x8021 repeated 8 times.
 */
import type { Hex } from "viem"

export const BUILDER_ATTRIBUTION_SUFFIX: Hex =
  "0x62635f69616d6f7870776a0b0080218021802180218021802180218021"
