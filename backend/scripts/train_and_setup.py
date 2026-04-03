import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from ml.synthetic_data import generate_and_save_dataset
from ml.train_model import ModelTrainer


def main():
    """Run complete training pipeline."""
    
    print("="*60)
    print(" LiveRisk AI - Model Training Setup")
    print("="*60)
    
    # Step 1: Generate dataset
    print("\n Step 1: Generating synthetic dataset...")
    data_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'data',
        'insurance_dataset.csv'
    )
    
    df = generate_and_save_dataset(10000)
    
    # Step 2: Train models
    print("\n Step 2: Training ML models...")
    trainer = ModelTrainer(data_path)
    results = trainer.run_full_pipeline()
    
    # Step 3: Summary
    print("\n" + "="*60)
    print(" SETUP COMPLETE!")
    print("="*60)
    print("\n Generated files:")
    print("   - data/insurance_dataset.csv (10,000 records)")
    print("   - data/trained_model.pkl (ML models)")
    print("   - data/feature_scaler.pkl (Feature engineering)")
    print("   - data/training_metrics.json (Performance metrics)")
    print("\n You can now start the server with: uvicorn main:app --reload")
    
    return results


if __name__ == "__main__":
    main()