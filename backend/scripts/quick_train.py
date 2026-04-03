import os
import sys
import argparse
import time

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from ml.data_adapter import UniversalDataAdapter
from ml.train_model import ModelTrainer


def quick_train(data_path: str, samples: int = None):
    """
    Quick training pipeline for any dataset.
    
    Args:
        data_path: Path to judge's dataset
        samples: Number of samples to use (None = all)
    """
    
    start_time = time.time()
    
    print("="*60)
    print(" QUICK TRAINING PIPELINE")
    print("="*60)
    
    # Step 1: Adapt data
    print("\n Step 1: Adapting dataset...")
    adapter = UniversalDataAdapter()
    df = adapter.load_data(data_path)
    
    # Limit samples if specified
    if samples and samples < len(df):
        df = df.sample(n=samples, random_state=42)
        print(f"   Using {samples} samples for faster training")
    
    adapted_df = adapter.adapt(df, auto_mode=True)
    
    # Save adapted data
    output_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'data',
        'insurance_dataset.csv'
    )
    adapter.save_adapted_data(adapted_df, output_path)
    
    # Step 2: Train models
    print("\n Step 2: Training models...")
    trainer = ModelTrainer(output_path)
    results = trainer.run_full_pipeline()
    
    # Step 3: Summary
    elapsed = time.time() - start_time
    
    print("\n" + "="*60)
    print(" QUICK TRAINING COMPLETE!")
    print("="*60)
    print(f"\n Total time: {elapsed:.1f} seconds")
    print(f"\n Dataset: {len(adapted_df)} records")
    print(f" Best Model: {results['best_models']['classification']['name']}")
    print(f" Accuracy: {results['best_models']['classification']['metrics']['accuracy']:.2%}")
    print(f" ROC-AUC: {results['best_models']['classification']['metrics']['roc_auc']:.2%}")
    
    print("\n Ready! Start server with: uvicorn main:app --reload")
    
    return results


def main():
    parser = argparse.ArgumentParser(description="Quick train on any dataset")
    parser.add_argument('--data', '-d', required=True, help='Path to dataset')
    parser.add_argument('--samples', '-n', type=int, default=None, help='Limit samples for speed')
    
    args = parser.parse_args()
    
    quick_train(args.data, args.samples)


if __name__ == "__main__":
    main()