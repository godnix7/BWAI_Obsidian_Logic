import random
import asyncio
from typing import Dict, Any, List, Optional
from uuid import UUID

class AIService:
    @staticmethod
    async def analyze_lab_report(title: str, content_summary: str = "") -> Dict[str, Any]:
        """
        Simulates AI analysis of a medical lab report.
        In a production environment, this would call Gemini / Vertex AI.
        """
        # Simulate processing delay
        await asyncio.sleep(1.5)

        # Mock insights based on keywords in title
        title_lower = title.lower()
        
        insights = {
            "summary": f"Automated analysis of {title}.",
            "findings": [],
            "recommendations": [],
            "risk_level": "Low",
            "detected_metrics": {}
        }

        if "blood" in title_lower or "cbc" in title_lower:
            insights["summary"] = "The Blood Count report shows mostly normal parameters with slight variations."
            insights["findings"] = ["Hemoglobin at 13.2 g/dL (Normal)", "WBC count within range"]
            insights["detected_metrics"] = {"Hemoglobin": "13.2", "WBC": "7500"}
        elif "diabetes" in title_lower or "glucose" in title_lower or "sugar" in title_lower:
            insights["summary"] = "Glucose levels appear slightly elevated compared to fasting baseline."
            insights["findings"] = ["Fasting Blood Sugar: 110 mg/dL (Pre-diabetic range)"]
            insights["recommendations"] = ["Monitor sugar intake", "Repeat test in 3 months"]
            insights["risk_level"] = "Medium"
            insights["detected_metrics"] = {"FBS": "110"}
        elif "kidney" in title_lower or "renal" in title_lower:
            insights["summary"] = "Renal function parameters are within optimal limits."
            insights["findings"] = ["Creatinine: 0.9 mg/dL", "eGFR: 95 mL/min/1.73m2"]
            insights["detected_metrics"] = {"Creatinine": "0.9", "eGFR": "95"}
        else:
            insights["summary"] = "Report processed. No critical abnormalities detected automatically."
            insights["findings"] = ["Stable baseline"]
            insights["recommendations"] = ["Consult with your physician for a detailed review"]

        return insights

    @staticmethod
    async def get_health_score_trend(patient_id: UUID) -> List[Dict[str, Any]]:
        """
        Mock health score trend generation.
        """
        labels = ["Jan", "Feb", "Mar", "Apr", "May"]
        return [
            {"month": label, "score": random.randint(70, 95)}
            for label in labels
        ]

ai_service = AIService()
