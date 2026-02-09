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


# Makeup recommendation logic - FRENCH VERSION
def get_foundation_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 1: Fond de teint / Base"""
    recommendations = []
    tips = []
    
    # Coverage based on occasion
    coverage = "moyenne" if profile.occasion in ["everyday", "work"] else "complète"
    
    # Undertone to shade family
    shade_family = {
        "cool": "rosé/rose",
        "warm": "doré/jaune",
        "neutral": "beige neutre",
        "olive": "olive/jaune-vert"
    }.get(profile.undertone, "neutre")
    
    # Finish based on skin type
    finish_map = {
        "oily": "mat ou semi-mat",
        "dry": "lumineux ou hydratant",
        "combination": "naturel/satiné",
        "normal": "naturel/satiné"
    }
    finish = finish_map.get(profile.skin_type, "naturel")
    
    recommendations.append(f"Utilisez un fond de teint à couvrance {coverage} avec des sous-tons {shade_family}")
    recommendations.append(f"Choisissez une formule au fini {finish}")
    
    tips.append("Appliquez avec une éponge humide pour un fini naturel")
    tips.append("Commencez par le centre du visage et estompez vers l'extérieur")
    tips.append("Construisez la couvrance progressivement sur les zones qui en ont besoin")
    
    return StepRecommendation(
        step_name="foundation",
        step_number=1,
        title="Fond de Teint / Base",
        recommendations=recommendations,
        tips=tips
    )


def get_concealer_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 2: Correcteur"""
    recommendations = []
    tips = []
    
    recommendations.append("Utilisez un correcteur 1 teinte plus claire que votre fond de teint pour les cernes")
    
    # Corrector recommendation for deeper skin tones
    if profile.skin_tone in ["medium", "tan", "deep"]:
        corrector_color = {
            "medium": "pêche",
            "tan": "orange-pêche",
            "deep": "orange ou rouge-orangé"
        }.get(profile.skin_tone, "pêche")
        recommendations.append(f"Appliquez un correcteur de couleur {corrector_color} sous le correcteur si vous avez des cernes")
    
    recommendations.append("Utilisez la même teinte que votre fond de teint pour camoufler les imperfections")
    
    tips.append("Tapotez, ne frottez pas - les mouvements de tapotement estompent mieux")
    tips.append("Fixez le correcteur sous les yeux avec une poudre légère pour éviter les plis")
    tips.append("Appliquez en forme de triangle inversé sous les yeux pour illuminer")
    
    return StepRecommendation(
        step_name="concealer",
        step_number=2,
        title="Correcteur",
        recommendations=recommendations,
        tips=tips
    )


def get_powder_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 3: Poudre (Optionnel)"""
    recommendations = []
    tips = []
    skip = False
    skip_reason = None
    
    if profile.skin_type == "dry":
        skip = True
        skip_reason = "Avec une peau sèche, vous pouvez sauter la poudre ou l'appliquer très légèrement sous les yeux uniquement"
        recommendations.append("Si vous choisissez d'utiliser de la poudre, fixez uniquement sous les yeux")
        tips.append("Utilisez une poudre fixante finement broyée et hydratante")
    elif profile.skin_type in ["oily", "combination"]:
        recommendations.append("Fixez votre zone T (front, nez, menton) avec de la poudre")
        recommendations.append("Laissez les joues sans poudre pour un éclat sain")
        tips.append("Utilisez un pinceau duveteux et tapotez l'excédent avant d'appliquer")
        tips.append("Pressez la poudre dans la peau, ne balayez pas")
    else:
        recommendations.append("Fixez légèrement tout votre visage avec une fine couche de poudre")
        tips.append("Utilisez un grand pinceau duveteux pour une application uniforme")
    
    # Flashback warning for deep skin
    if profile.skin_tone == "deep":
        tips.append("Évitez les poudres blanches ou translucides - elles peuvent créer un effet flash sur les photos")
        tips.append("Recherchez des poudres fixantes formulées pour les peaux foncées")
    
    return StepRecommendation(
        step_name="powder",
        step_number=3,
        title="Poudre Fixante",
        recommendations=recommendations,
        tips=tips,
        skip=skip,
        skip_reason=skip_reason
    )


def get_brows_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 4: Sourcils"""
    recommendations = []
    tips = []
    
    # Brow color based on undertone
    brow_shade = {
        "cool": "brun cendré ou taupe",
        "warm": "brun chaud ou brun doux",
        "neutral": "brun moyen",
        "olive": "brun moyen avec une légère chaleur"
    }.get(profile.undertone, "brun")
    
    recommendations.append(f"Utilisez un crayon ou une poudre à sourcils {brow_shade}")
    
    if profile.makeup_level == "beginner":
        recommendations.append("Concentrez-vous uniquement sur le remplissage des zones clairsemées")
        recommendations.append("Évitez les sourcils nets et définis - gardez un aspect naturel")
        tips.append("Utilisez des traits légers imitant les poils dans le sens naturel de vos sourcils")
    else:
        recommendations.append("Définissez la forme de vos sourcils tout en gardant un aspect naturel")
        tips.append("Utilisez une brosse à sourcils pour estomper le produit")
    
    tips.append("Brossez les sourcils vers le haut d'abord, puis vers l'extérieur")
    tips.append("Fixez avec un gel à sourcils transparent ou teinté pour une tenue longue durée")
    
    return StepRecommendation(
        step_name="brows",
        step_number=4,
        title="Sourcils",
        recommendations=recommendations,
        tips=tips
    )


def get_eyeshadow_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 5: Fard à paupières"""
    recommendations = []
    tips = []
    
    # Color recommendations based on skin tone
    color_map = {
        "very_fair": {"all_over": "champagne ou beige doux", "crease": "taupe ou brun doux", "shimmer": "champagne ou or clair"},
        "fair": {"all_over": "pêche doux ou nude", "crease": "brun doux ou mauve", "shimmer": "champagne ou rose scintillant"},
        "light": {"all_over": "beige chaud ou pêche doux", "crease": "brun chaud", "shimmer": "or ou or rose"},
        "medium": {"all_over": "brun chaud ou bronze", "crease": "brun chocolat", "shimmer": "or ou cuivre"},
        "tan": {"all_over": "bronze ou brun chaud", "crease": "brun profond", "shimmer": "bronze ou cuivre"},
        "deep": {"all_over": "chocolat ou bronze chaud", "crease": "prune profond ou chocolat", "shimmer": "cuivre ou bronze"}
    }
    
    colors = color_map.get(profile.skin_tone, color_map["medium"])
    
    if profile.makeup_level == "beginner":
        recommendations.append(f"Appliquez {colors['all_over']} sur toute la paupière comme base")
        recommendations.append(f"Ajoutez {colors['crease']} dans le creux pour la définition")
        recommendations.append(f"Tapotez {colors['shimmer']} au centre de la paupière")
        tips.append("Restez simple avec 2-3 teintes maximum")
        tips.append("Utilisez votre doigt pour appliquer le shimmer pour plus d'impact")
    else:
        recommendations.append(f"Commencez avec une teinte de transition en {colors['all_over']}")
        recommendations.append(f"Construisez la profondeur avec {colors['crease']} dans le creux")
        recommendations.append(f"Illuminez avec {colors['shimmer']} au centre de la paupière et au coin interne")
    
    # Occasion-specific adjustments
    if profile.occasion == "night_out" or profile.occasion == "special_event":
        recommendations.append("Ajoutez une touche de shimmer au coin interne pour plus de luminosité")
        tips.append("Vous pouvez aller légèrement plus foncé/plus dramatique pour les looks du soir")
    
    tips.append("Estompez en mouvements d'essuie-glace pour une couleur homogène")
    tips.append("Appliquez le fard à paupières avant le fond de teint pour récupérer les retombées")
    
    return StepRecommendation(
        step_name="eyeshadow",
        step_number=5,
        title="Fard à Paupières",
        recommendations=recommendations,
        tips=tips
    )


def get_eyeliner_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 6: Eyeliner & Mascara"""
    recommendations = []
    tips = []
    
    # Liner color based on occasion
    liner_color = "brun" if profile.occasion in ["everyday", "work"] else "noir"
    
    recommendations.append(f"Utilisez un eyeliner {liner_color} près de la ligne des cils")
    
    if profile.makeup_level == "beginner":
        recommendations.append("Gardez le trait fin et proche de vos cils")
        recommendations.append("Appliquez seulement 1-2 couches de mascara")
        tips.append("Commencez par le coin externe et travaillez vers l'intérieur pour plus de contrôle")
        tips.append("Faites des zigzags avec la brosse à mascara à la base des cils pour plus de volume")
    else:
        recommendations.append("Vous pouvez créer un petit trait d'aile pour plus de définition")
        recommendations.append("Superposez 2-3 couches de mascara en laissant sécher légèrement entre chaque")
    
    tips.append("Tracez entre les cils (tightlining) pour un effet cils plus fournis")
    tips.append("Recourbez les cils avant le mascara pour plus de lift")
    
    return StepRecommendation(
        step_name="eyeliner",
        step_number=6,
        title="Eyeliner & Mascara",
        recommendations=recommendations,
        tips=tips
    )


def get_blush_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 7: Blush"""
    recommendations = []
    tips = []
    
    # Blush color based on skin tone
    blush_map = {
        "very_fair": "rose doux ou pêche clair",
        "fair": "rose ou pêche",
        "light": "pêche ou rose doux",
        "medium": "corail ou rose chaud",
        "tan": "corail ou pêche chaud",
        "deep": "baie, brique ou corail orangé"
    }
    
    blush_color = blush_map.get(profile.skin_tone, "rose")
    
    recommendations.append(f"Utilisez un blush {blush_color}")
    recommendations.append("Appliquez sur les pommettes et estompez vers le haut")
    
    tips.append("Souriez légèrement pour trouver les pommettes")
    tips.append("Commencez avec une petite quantité - vous pouvez toujours en ajouter")
    tips.append("Estompez en mouvements circulaires vers les tempes")
    
    if profile.skin_type == "oily":
        tips.append("Utilisez un blush poudre pour une meilleure tenue")
    else:
        tips.append("Le blush crème donne un fini plus naturel et lumineux")
    
    return StepRecommendation(
        step_name="blush",
        step_number=7,
        title="Blush",
        recommendations=recommendations,
        tips=tips
    )


def get_bronzer_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 8: Bronzer / Contouring (Optionnel)"""
    recommendations = []
    tips = []
    skip = False
    skip_reason = None
    
    # Bronzer shade based on undertone
    bronzer_shade = {
        "cool": "bronzer neutre ou légèrement froid",
        "warm": "bronzer chaud et doré",
        "neutral": "bronzer neutre avec une légère chaleur",
        "olive": "bronzer olive ou neutre-chaud"
    }.get(profile.undertone, "bronzer neutre")
    
    if profile.makeup_level == "beginner":
        recommendations.append(f"Utilisez un {bronzer_shade} (1-2 teintes plus foncé que votre peau)")
        recommendations.append("Appliquez légèrement sous les pommettes et le long de la racine des cheveux")
        tips.append("Évitez le contouring pour l'instant - le bronzer donne un effet bonne mine naturel")
        tips.append("Utilisez un pinceau duveteux et estompez bien pour éviter les démarcations")
    else:
        recommendations.append(f"Utilisez un {bronzer_shade} pour réchauffer le teint")
        recommendations.append("Appliquez dans les creux des joues, les tempes et la mâchoire")
        tips.append("Estompez vers le haut, jamais vers le bas, pour un effet liftant")
    
    tips.append("Technique du '3': appliquez en forme de '3' du front à la joue puis à la mâchoire")
    tips.append("Moins c'est plus - construisez progressivement")
    
    return StepRecommendation(
        step_name="bronzer",
        step_number=8,
        title="Bronzer & Contouring",
        recommendations=recommendations,
        tips=tips,
        skip=skip,
        skip_reason=skip_reason
    )


def get_lips_recommendation(profile: UserProfile) -> StepRecommendation:
    """Étape 9: Lèvres"""
    recommendations = []
    tips = []
    
    # Lip color based on undertone
    lip_map = {
        "cool": {"nude": "mauve ou rose froid", "bold": "baie ou rouge bleuté"},
        "warm": {"nude": "nude pêche ou corail", "bold": "corail ou rouge chaud"},
        "neutral": {"nude": "rose nude ou rosé", "bold": "rouge classique ou baie"},
        "olive": {"nude": "nude chaud ou terracotta", "bold": "rouge brique ou baie"}
    }
    
    colors = lip_map.get(profile.undertone, lip_map["neutral"])
    
    if profile.occasion in ["everyday", "work"]:
        recommendations.append(f"Appliquez une couleur {colors['nude']}")
    else:
        recommendations.append(f"Optez pour une teinte {colors['bold']} pour un look affirmé")
        recommendations.append(f"Ou restez sobre avec {colors['nude']}")
    
    if profile.makeup_level == "beginner":
        recommendations.append("Choisissez un gloss ou un fini satiné pour une application facile")
        tips.append("Tapotez la couleur avec le doigt pour un effet plus naturel")
    else:
        recommendations.append("Vous pouvez utiliser un crayon à lèvres pour définir et prolonger la tenue")
        tips.append("Appliquez le rouge à lèvres, tamponnez avec un mouchoir et réappliquez pour une meilleure tenue")
    
    tips.append("Exfoliez et hydratez les lèvres au préalable pour une application lisse")
    tips.append("Pour des lèvres plus pulpeuses, ajoutez une touche de gloss au centre")
    
    return StepRecommendation(
        step_name="lips",
        step_number=9,
        title="Lèvres",
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
    return {"message": "GlowGuide API - Votre Coach Maquillage Personnel"}


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
        raise HTTPException(status_code=404, detail="Routine introuvable")
    
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
