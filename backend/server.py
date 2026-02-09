from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class UserProfile(BaseModel):
    skin_tone: str  # very_fair, fair, light, medium, tan, deep
    undertone: str  # cool, warm, neutral, olive
    skin_type: str  # oily, dry, combination, normal
    makeup_level: str  # beginner, intermediate
    occasion: str  # everyday, work, night_out, special_event


class StepRecommendation(BaseModel):
    step_name: str
    step_number: int
    title: str
    recommendations: List[str]
    tips: List[str]
    skip: bool = False
    skip_reason: Optional[str] = None


class RoutineResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    share_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    profile: UserProfile
    steps: List[StepRecommendation]
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class SaveRoutineRequest(BaseModel):
    profile: UserProfile
    steps: List[StepRecommendation]


# Makeup recommendation logic
def get_foundation_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 1: Foundation/Base"""
    recommendations = []
    tips = []
    
    # Coverage based on occasion
    coverage = "medium" if profile.occasion in ["everyday", "work"] else "full"
    
    # Undertone to shade family
    shade_family = {
        "cool": "rosy/pink",
        "warm": "golden/yellow",
        "neutral": "neutral beige",
        "olive": "olive/yellow-green"
    }.get(profile.undertone, "neutral")
    
    # Finish based on skin type
    finish_map = {
        "oily": "matte or soft-matte",
        "dry": "dewy or hydrating",
        "combination": "natural/satin",
        "normal": "natural/satin"
    }
    finish = finish_map.get(profile.skin_type, "natural")
    
    recommendations.append(f"Use a {coverage} coverage foundation with {shade_family} undertones")
    recommendations.append(f"Choose a {finish} finish formula")
    
    tips.append("Apply with a damp beauty sponge for the most natural finish")
    tips.append("Start from the center of your face and blend outward")
    tips.append("Build coverage gradually in areas that need it")
    
    return StepRecommendation(
        step_name="foundation",
        step_number=1,
        title="Foundation / Base",
        recommendations=recommendations,
        tips=tips
    )


def get_concealer_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 2: Concealer"""
    recommendations = []
    tips = []
    
    recommendations.append("Use a concealer 1 shade lighter than your foundation for under-eyes")
    
    # Corrector recommendation for deeper skin tones
    if profile.skin_tone in ["medium", "tan", "deep"]:
        corrector_color = {
            "medium": "peach",
            "tan": "orange-peach",
            "deep": "orange or red-orange"
        }.get(profile.skin_tone, "peach")
        recommendations.append(f"Apply {corrector_color} color corrector under concealer if you have dark circles")
    
    recommendations.append("Use your exact foundation shade for spot concealing")
    
    tips.append("Tap, don't swipe - patting motions blend better")
    tips.append("Set under-eye concealer with a light powder to prevent creasing")
    tips.append("Apply in an inverted triangle shape under eyes for brightening effect")
    
    return StepRecommendation(
        step_name="concealer",
        step_number=2,
        title="Concealer",
        recommendations=recommendations,
        tips=tips
    )


def get_powder_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 3: Powder (Optional)"""
    recommendations = []
    tips = []
    skip = False
    skip_reason = None
    
    if profile.skin_type == "dry":
        skip = True
        skip_reason = "With dry skin, you can skip powder or apply very lightly under eyes only"
        recommendations.append("If you choose to use powder, only micro-set under your eyes")
        tips.append("Use a finely-milled, hydrating setting powder")
    elif profile.skin_type in ["oily", "combination"]:
        recommendations.append("Set your T-zone (forehead, nose, chin) with powder")
        recommendations.append("Leave cheeks powder-free for a healthy glow")
        tips.append("Use a fluffy brush and tap off excess before applying")
        tips.append("Press powder into skin, don't sweep")
    else:
        recommendations.append("Lightly set your entire face with a thin layer of powder")
        tips.append("Use a large fluffy brush for even application")
    
    # Flashback warning for deep skin
    if profile.skin_tone == "deep":
        tips.append("Avoid white or translucent powders - they can cause flashback in photos")
        tips.append("Look for setting powders specifically formulated for deeper skin tones")
    
    return StepRecommendation(
        step_name="powder",
        step_number=3,
        title="Setting Powder",
        recommendations=recommendations,
        tips=tips,
        skip=skip,
        skip_reason=skip_reason
    )


def get_brows_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 4: Brows"""
    recommendations = []
    tips = []
    
    # Brow color based on undertone
    brow_shade = {
        "cool": "ash brown or taupe",
        "warm": "warm brown or soft brown",
        "neutral": "medium brown",
        "olive": "medium brown with slight warmth"
    }.get(profile.undertone, "brown")
    
    recommendations.append(f"Use a {brow_shade} brow pencil or powder")
    
    if profile.makeup_level == "beginner":
        recommendations.append("Focus on filling in sparse areas only")
        recommendations.append("Avoid sharp, defined brows - keep it natural")
        tips.append("Use light, hair-like strokes following your natural brow direction")
    else:
        recommendations.append("Define your brow shape while keeping it natural")
        tips.append("Use a spoolie to blend product through brows")
    
    tips.append("Brush brows upward first, then outward")
    tips.append("Set with clear or tinted brow gel for all-day hold")
    
    return StepRecommendation(
        step_name="brows",
        step_number=4,
        title="Brows",
        recommendations=recommendations,
        tips=tips
    )


def get_eyeshadow_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 5: Eyeshadow"""
    recommendations = []
    tips = []
    
    # Color recommendations based on skin tone
    color_map = {
        "very_fair": {"all_over": "champagne or soft beige", "crease": "taupe or soft brown", "shimmer": "champagne or light gold"},
        "fair": {"all_over": "soft peach or nude", "crease": "soft brown or mauve", "shimmer": "champagne or pink shimmer"},
        "light": {"all_over": "warm beige or soft peach", "crease": "warm brown", "shimmer": "gold or rose gold"},
        "medium": {"all_over": "warm brown or bronze", "crease": "chocolate brown", "shimmer": "gold or copper"},
        "tan": {"all_over": "bronze or warm brown", "crease": "deep brown", "shimmer": "bronze or copper"},
        "deep": {"all_over": "chocolate or warm bronze", "crease": "deep plum or chocolate", "shimmer": "copper or bronze"}
    }
    
    colors = color_map.get(profile.skin_tone, color_map["medium"])
    
    if profile.makeup_level == "beginner":
        recommendations.append(f"Apply {colors['all_over']} all over your lid as a base")
        recommendations.append(f"Add {colors['crease']} in your crease for definition")
        recommendations.append(f"Pat {colors['shimmer']} on the center of your lid")
        tips.append("Keep it simple with 2-3 shades maximum")
        tips.append("Use your finger to apply shimmer for more impact")
    else:
        recommendations.append(f"Start with a transition shade in {colors['all_over']}")
        recommendations.append(f"Build depth with {colors['crease']} in the crease")
        recommendations.append(f"Highlight with {colors['shimmer']} on lid center and inner corner")
    
    # Occasion-specific adjustments
    if profile.occasion == "night_out" or profile.occasion == "special_event":
        recommendations.append("Add a touch of shimmer to the inner corner for extra brightness")
        tips.append("You can go slightly darker/more dramatic for evening looks")
    
    tips.append("Blend in windshield wiper motions for seamless color")
    tips.append("Apply eyeshadow before foundation to catch any fallout")
    
    return StepRecommendation(
        step_name="eyeshadow",
        step_number=5,
        title="Eyeshadow",
        recommendations=recommendations,
        tips=tips
    )


def get_eyeliner_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 6: Eyeliner & Mascara"""
    recommendations = []
    tips = []
    
    # Liner color based on occasion
    liner_color = "brown" if profile.occasion in ["everyday", "work"] else "black"
    
    recommendations.append(f"Use {liner_color} eyeliner close to your lash line")
    
    if profile.makeup_level == "beginner":
        recommendations.append("Keep the line thin and close to your lashes")
        recommendations.append("Apply 1-2 coats of mascara only")
        tips.append("Start from the outer corner and work inward for more control")
        tips.append("Wiggle the mascara wand at the base of lashes for volume")
    else:
        recommendations.append("You can create a small wing for added definition")
        recommendations.append("Layer 2-3 coats of mascara, letting each coat dry slightly")
    
    tips.append("Tightline (apply liner between lashes) for a fuller lash look")
    tips.append("Curl lashes before mascara for more lift")
    
    return StepRecommendation(
        step_name="eyeliner",
        step_number=6,
        title="Eyeliner & Mascara",
        recommendations=recommendations,
        tips=tips
    )


def get_blush_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 7: Blush"""
    recommendations = []
    tips = []
    
    # Blush color based on skin tone
    blush_map = {
        "very_fair": "soft pink or light peach",
        "fair": "pink or peach",
        "light": "peach or soft rose",
        "medium": "coral or warm rose",
        "tan": "coral or warm peach",
        "deep": "berry, brick red, or orange-coral"
    }
    
    blush_color = blush_map.get(profile.skin_tone, "rose")
    
    recommendations.append(f"Use a {blush_color} blush")
    recommendations.append("Apply to the apples of your cheeks and blend upward")
    
    tips.append("Smile lightly to find the apples of your cheeks")
    tips.append("Start with a small amount - you can always add more")
    tips.append("Blend in upward circular motions toward your temples")
    
    if profile.skin_type == "oily":
        tips.append("Use a powder blush for longer wear")
    else:
        tips.append("Cream blush gives a more natural, dewy finish")
    
    return StepRecommendation(
        step_name="blush",
        step_number=7,
        title="Blush",
        recommendations=recommendations,
        tips=tips
    )


def get_bronzer_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 8: Bronzer / Contour (Optional)"""
    recommendations = []
    tips = []
    skip = False
    skip_reason = None
    
    # Bronzer shade based on undertone
    bronzer_shade = {
        "cool": "neutral or slightly cool-toned bronzer",
        "warm": "warm, golden bronzer",
        "neutral": "neutral bronzer with slight warmth",
        "olive": "olive or neutral-warm bronzer"
    }.get(profile.undertone, "neutral bronzer")
    
    if profile.makeup_level == "beginner":
        recommendations.append(f"Use a {bronzer_shade} (1-2 shades deeper than your skin)")
        recommendations.append("Apply lightly under cheekbones and along hairline")
        tips.append("Skip contouring for now - bronzer gives a natural sun-kissed look")
        tips.append("Use a fluffy brush and blend well to avoid harsh lines")
    else:
        recommendations.append(f"Use a {bronzer_shade} for warmth")
        recommendations.append("Apply to hollows of cheeks, temples, and jawline")
        tips.append("Blend upward, never downward, for a lifted effect")
    
    tips.append("The number '3' technique: apply in a '3' shape from forehead to cheek to jawline")
    tips.append("Less is more - build up gradually")
    
    return StepRecommendation(
        step_name="bronzer",
        step_number=8,
        title="Bronzer & Contour",
        recommendations=recommendations,
        tips=tips,
        skip=skip,
        skip_reason=skip_reason
    )


def get_lips_recommendation(profile: UserProfile) -> StepRecommendation:
    """Step 9: Lips"""
    recommendations = []
    tips = []
    
    # Lip color based on undertone
    lip_map = {
        "cool": {"nude": "mauve or cool pink", "bold": "berry or blue-red"},
        "warm": {"nude": "peach or coral nude", "bold": "coral or warm red"},
        "neutral": {"nude": "nude pink or rose", "bold": "classic red or berry"},
        "olive": {"nude": "warm nude or terracotta", "bold": "brick red or berry"}
    }
    
    colors = lip_map.get(profile.undertone, lip_map["neutral"])
    
    if profile.occasion in ["everyday", "work"]:
        recommendations.append(f"Apply a {colors['nude']} lip color")
    else:
        recommendations.append(f"Go for a {colors['bold']} shade for a statement look")
        recommendations.append(f"Or keep it simple with {colors['nude']}")
    
    if profile.makeup_level == "beginner":
        recommendations.append("Choose a gloss or satin finish for easier application")
        tips.append("Tap lip color with your finger for a softer, natural look")
    else:
        recommendations.append("You can use lip liner to define and extend wear")
        tips.append("Apply lipstick, blot with tissue, and reapply for longer wear")
    
    tips.append("Exfoliate and moisturize lips beforehand for smooth application")
    tips.append("For fuller-looking lips, add a touch of gloss to the center")
    
    return StepRecommendation(
        step_name="lips",
        step_number=9,
        title="Lips",
        recommendations=recommendations,
        tips=tips
    )


def generate_full_routine(profile: UserProfile) -> List[StepRecommendation]:
    """Generate all makeup steps based on user profile"""
    return [
        get_foundation_recommendation(profile),
        get_concealer_recommendation(profile),
        get_powder_recommendation(profile),
        get_brows_recommendation(profile),
        get_eyeshadow_recommendation(profile),
        get_eyeliner_recommendation(profile),
        get_blush_recommendation(profile),
        get_bronzer_recommendation(profile),
        get_lips_recommendation(profile)
    ]


# API Routes
@api_router.get("/")
async def root():
    return {"message": "GlowGuide API - Your Personal Makeup Coach"}


@api_router.post("/recommendations", response_model=List[StepRecommendation])
async def get_recommendations(profile: UserProfile):
    """Generate makeup recommendations based on user profile"""
    return generate_full_routine(profile)


@api_router.post("/routines", response_model=RoutineResponse)
async def save_routine(request: SaveRoutineRequest):
    """Save a routine and get a shareable link"""
    routine = RoutineResponse(
        profile=request.profile,
        steps=request.steps
    )
    
    doc = routine.model_dump()
    await db.routines.insert_one(doc)
    
    return routine


@api_router.get("/routines/{share_id}", response_model=RoutineResponse)
async def get_routine(share_id: str):
    """Get a routine by its share ID"""
    routine = await db.routines.find_one({"share_id": share_id}, {"_id": 0})
    
    if not routine:
        raise HTTPException(status_code=404, detail="Routine not found")
    
    return routine


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
