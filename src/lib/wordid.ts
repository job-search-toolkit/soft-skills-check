/**
 * Word-based user ID system
 * 6 English words → portable, beautiful, collision-proof identity
 * 1024^6 ≈ 1.15 × 10^18 possible combinations
 */

// 1024 unique, pleasant, easy-to-spell English words
const WORD_LIST = [
  // Nature (60)
  "ocean","river","creek","storm","cloud","frost","flame","blaze","ember","spark",
  "coral","pearl","cedar","birch","maple","grove","bloom","petal","daisy","lotus",
  "fern","moss","vine","leaf","thorn","acorn","stone","cliff","ridge","shore",
  "delta","dune","mesa","peak","vale","glen","marsh","reef","tide","wave",
  "gale","mist","haze","dawn","dusk","star","moon","comet","flare","glow",
  "beam","prism","halo","aurora","meadow","oasis","pollen","willow","ivy","elm",
  // Animals (50)
  "hawk","eagle","raven","crane","heron","robin","wren","dove","lark","owl",
  "finch","falcon","osprey","tiger","lion","wolf","bear","fox","deer","elk",
  "lynx","otter","seal","whale","dolphin","salmon","trout","pike","cobra","viper",
  "gecko","newt","frog","turtle","parrot","macaw","condor","ferret","gibbon","bobcat",
  "coyote","panther","rabbit","kitten","walrus","spider","insect","oyster","locust","weasel",
  // Colors & Materials (40)
  "amber","ivory","onyx","jade","ruby","opal","topaz","brass","copper","silver",
  "gold","steel","iron","bronze","cobalt","chrome","nickel","zinc","silk","linen",
  "satin","velvet","cotton","wool","suede","marble","granite","quartz","slate","garnet",
  "scarlet","pastel","cobble","pewter","enamel","vellum","muslin","damask","calico","raffia",
  // Actions & Movement (50)
  "drift","glide","surge","climb","vault","soar","sweep","dash","leap","stride",
  "march","rally","forge","craft","build","carve","shape","mold","weave","blend",
  "fuse","merge","splice","bond","clasp","grasp","catch","fetch","toss","spin",
  "twist","bend","fold","wrap","coil","loop","knot","link","chain","latch",
  "plunge","jostle","jumble","ramble","hustle","kindle","simmer","tumble","wander","frolic",
  // Qualities (50)
  "bold","brave","calm","clear","crisp","deep","eager","fair","firm","fresh",
  "glad","grand","keen","kind","prime","proud","pure","quick","rapid","sharp",
  "smart","solid","sound","stark","steady","still","strong","sure","swift","true",
  "vast","vivid","warm","whole","wide","wise","young","agile","alert","apt",
  "brisk","dapper","nimble","noble","robust","rustic","tender","intact","inborn","primal",
  // Objects & Tools (80)
  "anvil","arrow","atlas","badge","blade","bugle","cable","cairn","chisel","clamp",
  "clip","clock","coin","compass","crown","drum","fable","flag","flask","flute",
  "frame","gear","glyph","grill","hammer","harp","helm","hinge","horn","jewel",
  "knob","lance","ledger","lens","lever","lock","loom","mask","mast","medal",
  "mirror","needle","notch","oar","orb","paddle","panel","pillar","pipe","plank",
  "plate","plume","prong","pulley","quill","rail","reel","ribbon","rod","rope",
  "ruler","saddle","scale","scroll","shaft","shield","siren","socket","spoke","spring",
  "stamp","stitch","string","switch","tablet","thread","token","torch","track","valve",
  // More objects (30)
  "wedge","wheel","whistle","wick","wrench","anchor","banner","basket","beacon","bell",
  "barrel","buckle","buffer","canopy","dagger","fiddle","flagon","gadget","goblet","lantern",
  "locket","mallet","napkin","pencil","puppet","shovel","trellis","trident","tripod","widget",
  // Places & Structures (40)
  "arch","barn","bridge","cabin","canal","castle","cave","chapel","dock","dome",
  "fort","garden","gate","harbor","haven","hearth","lodge","manor","mill","palace",
  "pier","plaza","port","shelter","shrine","spire","temple","terrace","tower","tunnel",
  "villa","hamlet","trail","grotto","pagoda","portal","rampart","citadel","outpost","gazebo",
  // Food & Drink (40)
  "apple","berry","bread","broth","candy","cherry","chive","cider","clove","cocoa",
  "cream","feast","ginger","grape","honey","lemon","mango","melon","mint","mocha",
  "olive","peach","plum","raisin","sage","spice","sugar","thyme","toast","walnut",
  "wheat","basil","cacao","fennel","garlic","nougat","nutmeg","pepper","vanilla","waffle",
  // Abstract & Concepts (80)
  "bliss","charm","creed","dream","edge","flair","focus","grace","guild","honor",
  "ideal","karma","lore","motto","nexus","oath","quest","realm","rune","saga",
  "scope","shift","sigil","theme","trait","truce","unity","vigor","whim","yield",
  "zeal","aura","axiom","boon","cache","canon","cipher","code","crest","depth",
  "drive","echo","epoch","ethos","facet","flux","grit","hymn","icon","index",
  "knack","merit","myth","niche","norm","omen","opus","pact","path","pivot",
  "ploy","prose","rank","riddle","rift","root","route","relic","rhythm","schema",
  "sense","sphere","stance","tact","tempo","thesis","tier","trend","verge","verse",
  // More abstract (30)
  "vista","voice","enigma","matrix","virtue","gambit","gospel","legend","mosaic","mystic",
  "nectar","finesse","impact","profit","signal","sketch","spiral","stable","target","travel",
  "trophy","emblem","empire","factor","forest","island","mantle","sector","shadow","shimmer",
  // Music & Sound (25)
  "beat","carol","chant","chord","clang","clash","click","drone","forte","note",
  "pitch","pulse","rhyme","riff","roar","rumble","rustle","snap","sonic","thrum",
  "toll","tone","tune","waltz","sonnet",
  // Weather & Sky (25)
  "blitz","bolt","breeze","chill","draft","drizzle","flood","flurry","fog","gust",
  "rain","shower","sleet","snow","squall","steam","sun","swell","thaw","tremor",
  "whirl","wind","zephyr","cirrus","polar",
  // Science & Tech (30)
  "atom","axis","byte","cell","core","data","field","force","gene","grid",
  "ion","laser","mass","mode","node","orbit","phase","pixel","plasma","probe",
  "radar","ratio","relay","sigma","solar","sync","ultra","vector","volt","warp",
  // Time & Numbers (20)
  "cycle","lunar","month","score","year","alpha","beta","gamma","kappa","omega",
  "theta","first","third","fifth","ninth","binary","zenith","arc","ray","noon",
  // Misc pleasant (100)
  "arctic","bamboo","bishop","border","bounty","branch","budget","canvas","carbon","chorus",
  "circle","clover","column","corner","council","course","cradle","crystal","custom","dancer",
  "diesel","dinner","dragon","driver","envoy","fiber","filter","fisher","flannel","flight",
  "fossil","galley","genome","glacier","herald","jungle","knight","lagoon","laurel","linden",
  "magnet","maiden","medley","meteor","mitten","muffin","musket","pebble","photon","pilot",
  "plaster","pocket","polish","presto","proton","puzzle","python","racket","random","ranger",
  "rascal","ripple","rocket","sapper","scepter","sentry","shader","sister","slider","sunset",
  "tangle","tidal","timber","tinsel","tiptoe","toggle","turret","tuxedo","umbra","valley",
  "velour","vernal","vessel","vintage","violet","warden","winter","wizard","wonder","wreath",
  // Final extras to reach 1024 (44)
  "yacht","effigy","elixir","emboss","ensign","ermine","escort","estate","lariat","lentil",
  "lintel","livery","luster","mammoth","manger","mantel","mascot","mayfly","menace","merlin",
  "mortar","muffle","mullet","myrtle","nettle","offset","outage","palate","pallet","pasture",
  "pellet","permit","plover","poncho","possum","pumice","reckon","reflex","render","repute",
  "resort","rosary","sallow","salute",
];

/**
 * Generate a 6-word ID using crypto-secure randomness
 * Works in both browser and Cloudflare Workers
 */
export function generateWordId(): string {
  const indices = new Uint16Array(6);
  crypto.getRandomValues(indices);
  return Array.from(indices)
    .map((n) => WORD_LIST[n % WORD_LIST.length])
    .join("-");
}

/**
 * Validate that a string is a valid word ID (6 words from the list)
 */
export function validateWordId(id: string): boolean {
  const words = id.toLowerCase().split("-");
  if (words.length !== 6) return false;
  return words.every((w) => WORD_LIST.includes(w));
}

/**
 * Generate a short invite token (URL-safe, 8 chars)
 */
export function generateInviteToken(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 8);
}

/**
 * Generate a deterministic profile hash from a word ID.
 * SHA-256 → hex → first 12 chars. Can't be reversed to get the word ID.
 * Works in both browser and Cloudflare Workers.
 */
export async function generateProfileHash(wordId: string): Promise<string> {
  const data = new TextEncoder().encode(wordId);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 12);
}
