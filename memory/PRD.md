# GlowGuide - Personalized Makeup Coach

## Original Problem Statement
Create a web app for helping people with their makeup using a step-by-step guided flow. Users input their skin profile once, then receive personalized recommendations through 9 makeup steps.

## Architecture
- **Frontend**: React with Tailwind CSS, Shadcn UI components
- **Backend**: FastAPI with rule-based recommendation engine
- **Database**: MongoDB for storing saved routines
- **Storage**: Local storage for user profiles and saved routines list

## User Personas
- Makeup beginners wanting personalized guidance
- Intermediate users looking for occasion-specific looks
- Anyone seeking to remove guesswork from makeup application

## Core Requirements
1. One-time profile setup (skin tone, undertone, skin type, level, occasion)
2. Step-by-step guided makeup routine (9 steps)
3. Personalized recommendations based on user profile
4. Save and share routines functionality

## What's Been Implemented (Jan 2026)
- ✅ Landing page with feminine design (Playfair Display + Lato fonts, warm terracotta palette)
- ✅ 5-step profile setup flow with visual skin tone/undertone selectors
- ✅ 9-step makeup routine guide with vertical progress tracker
- ✅ Rule-based recommendation engine:
  - Foundation (coverage, undertone matching, finish by skin type)
  - Concealer (shade selection, corrector for deeper tones)
  - Powder (optional based on skin type)
  - Brows (color matching by undertone)
  - Eyeshadow (colors by skin tone, beginner-friendly structure)
  - Eyeliner & Mascara (occasion-based intensity)
  - Blush (skin tone appropriate colors)
  - Bronzer/Contour (undertone matching)
  - Lips (undertone-safe picks)
- ✅ Save routine with shareable link
- ✅ Saved routines page with delete functionality
- ✅ Shared routine view page
- ✅ Mobile-responsive design

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Core 9-step recommendation engine
- [x] Profile setup flow
- [x] Step-by-step guide UI
- [x] Save and share functionality

### P1 (Important) - Future
- [ ] Before/After image toggle
- [ ] Product recommendations integration
- [ ] Email sharing option

### P2 (Nice to Have) - Future
- [ ] Camera skin tone detection
- [ ] Product matching via Amazon/Sephora
- [ ] Creator routines marketplace
- [ ] Social sharing (Instagram, Pinterest)

## Next Tasks
1. Add product brand recommendations for each step
2. Implement "Before/After" visualization feature
3. Add print-friendly routine cards
4. Consider AI-powered skin tone detection from selfie
