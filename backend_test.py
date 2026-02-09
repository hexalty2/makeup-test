import requests
import sys
import json
from datetime import datetime

class GlowGuideAPITester:
    def __init__(self, base_url="https://glow-guide-19.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def test_api_health(self):
        """Test basic API connectivity"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Message: {data.get('message', 'N/A')}"
        except Exception as e:
            success = False
            details = f"Connection error: {str(e)}"
        
        self.log_result("API Health Check", success, details)
        return success

    def test_recommendations_api(self):
        """Test POST /api/recommendations endpoint"""
        test_profile = {
            "skin_tone": "medium",
            "undertone": "warm",
            "skin_type": "combination", 
            "makeup_level": "beginner",
            "occasion": "everyday"
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/recommendations",
                json=test_profile,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                # Validate response structure
                if isinstance(data, list) and len(data) == 9:
                    # Check first step structure
                    step = data[0]
                    required_fields = ['step_name', 'step_number', 'title', 'recommendations', 'tips']
                    has_required = all(field in step for field in required_fields)
                    success = has_required
                    details = f"Returned {len(data)} steps" if has_required else "Missing required fields"
                else:
                    success = False
                    details = f"Expected 9 steps, got {len(data) if isinstance(data, list) else 'non-list'}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
                
        except Exception as e:
            success = False
            details = f"Request error: {str(e)}"
        
        self.log_result("Recommendations API", success, details)
        return success, test_profile

    def test_save_routine_api(self, profile):
        """Test POST /api/routines endpoint"""
        # First get recommendations
        try:
            rec_response = requests.post(
                f"{self.api_url}/recommendations",
                json=profile,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if rec_response.status_code != 200:
                self.log_result("Save Routine API (get recommendations)", False, "Failed to get recommendations first")
                return False, None
                
            steps = rec_response.json()
            
            # Now test save routine
            save_request = {
                "profile": profile,
                "steps": steps
            }
            
            response = requests.post(
                f"{self.api_url}/routines",
                json=save_request,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            success = response.status_code == 200
            share_id = None
            
            if success:
                data = response.json()
                required_fields = ['id', 'share_id', 'profile', 'steps', 'created_at']
                has_required = all(field in data for field in required_fields)
                if has_required:
                    share_id = data['share_id']
                    details = f"Created routine with share_id: {share_id}"
                else:
                    success = False
                    details = "Missing required fields in response"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
                
        except Exception as e:
            success = False
            details = f"Request error: {str(e)}"
            share_id = None
        
        self.log_result("Save Routine API", success, details)
        return success, share_id

    def test_get_routine_api(self, share_id):
        """Test GET /api/routines/{share_id} endpoint"""
        if not share_id:
            self.log_result("Get Routine API", False, "No share_id provided")
            return False
            
        try:
            response = requests.get(
                f"{self.api_url}/routines/{share_id}",
                timeout=10
            )
            
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ['id', 'share_id', 'profile', 'steps', 'created_at']
                has_required = all(field in data for field in required_fields)
                if has_required and data['share_id'] == share_id:
                    details = f"Retrieved routine for share_id: {share_id}"
                else:
                    success = False
                    details = "Invalid response structure or share_id mismatch"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
                
        except Exception as e:
            success = False
            details = f"Request error: {str(e)}"
        
        self.log_result("Get Routine API", success, details)
        return success

    def test_invalid_share_id(self):
        """Test GET /api/routines/{invalid_id} returns 404"""
        invalid_id = "nonexistent123"
        
        try:
            response = requests.get(
                f"{self.api_url}/routines/{invalid_id}",
                timeout=10
            )
            
            success = response.status_code == 404
            details = f"Status: {response.status_code}" + (f", Response: {response.text[:50]}" if not success else "")
                
        except Exception as e:
            success = False
            details = f"Request error: {str(e)}"
        
        self.log_result("Invalid Share ID (404)", success, details)
        return success

    def test_different_profiles(self):
        """Test recommendations with different profile combinations"""
        test_profiles = [
            {
                "skin_tone": "very_fair",
                "undertone": "cool", 
                "skin_type": "dry",
                "makeup_level": "beginner",
                "occasion": "work"
            },
            {
                "skin_tone": "deep",
                "undertone": "warm",
                "skin_type": "oily", 
                "makeup_level": "intermediate",
                "occasion": "night_out"
            }
        ]
        
        all_passed = True
        for i, profile in enumerate(test_profiles):
            try:
                response = requests.post(
                    f"{self.api_url}/recommendations",
                    json=profile,
                    headers={'Content-Type': 'application/json'},
                    timeout=10
                )
                
                success = response.status_code == 200
                if success:
                    data = response.json()
                    success = isinstance(data, list) and len(data) == 9
                    
                if not success:
                    all_passed = False
                    
            except Exception:
                all_passed = False
                break
        
        self.log_result("Different Profile Combinations", all_passed, 
                       f"Tested {len(test_profiles)} profile combinations")
        return all_passed

    def run_all_tests(self):
        """Run comprehensive backend API tests"""
        print("🧪 Starting GlowGuide Backend API Tests...")
        print("=" * 50)
        
        # Test basic connectivity first
        if not self.test_api_health():
            print("⚠️  API health check failed - continuing with other tests...")
        
        # Test recommendations endpoint
        rec_success, test_profile = self.test_recommendations_api()
        
        # Test save routine endpoint
        save_success, share_id = self.test_save_routine_api(test_profile) if rec_success else (False, None)
        
        # Test get routine endpoint
        if share_id:
            self.test_get_routine_api(share_id)
        
        # Test error handling
        self.test_invalid_share_id()
        
        # Test different profile combinations
        self.test_different_profiles()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test execution"""
    tester = GlowGuideAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())