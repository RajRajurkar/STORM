import os
import sys
import argparse
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pandas as pd
import numpy as np

from ml.data_adapter import UniversalDataAdapter
from ml.train_model import ModelTrainer
from ml.model import MLRiskModel


def analyze_dataset(df: pd.DataFrame):
    """Show dataset analysis to judges."""
    
    print("\n" + "="*60)
    print(" DATASET ANALYSIS")
    print("="*60)
    
    print(f"\n Basic Info:")
    print(f"   Total Records: {len(df):,}")
    print(f"   Total Features: {len(df.columns)}")
    print(f"   Memory Usage: {df.memory_usage(deep=True).sum() / 1024 / 1024:.2f} MB")
    
    print(f"\n Columns ({len(df.columns)}):")
    for i, col in enumerate(df.columns, 1):
        dtype = df[col].dtype
        nulls = df[col].isna().sum()
        null_pct = (nulls / len(df)) * 100
        print(f"   {i:2}. {col:35} | Type: {str(dtype):10} | Nulls: {null_pct:.1f}%")
    
    # Numeric summary
    print(f"\n Numeric Features Summary:")
    numeric_df = df.select_dtypes(include=[np.number])
    if len(numeric_df.columns) > 0:
        print(numeric_df.describe().round(2).to_string())
    
    # Categorical summary
    print(f"\n Categorical Features:")
    cat_df = df.select_dtypes(include=['object', 'category'])
    for col in cat_df.columns[:5]:  # First 5
        print(f"\n   {col}:")
        print(f"   {df[col].value_counts().head(5).to_string()}")


def run_demo(data_path: str):
    """Run complete demo for judges."""
    
    start = time.time()
    
    print("\n" + "="*60)
    print(" LIVERISK AI - JUDGES DATASET DEMO")
    print("="*60)
    
    # Step 1: Load and analyze
    print("\n Loading judges' dataset...")
    adapter = UniversalDataAdapter()
    original_df = adapter.load_data(data_path)
    
    analyze_dataset(original_df)
    
    # Step 2: Adapt
    print("\n Adapting dataset to our format...")
    adapted_df = adapter.adapt(original_df, auto_mode=True)
    
    # Save
    output_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'data', 'insurance_dataset.csv'
    )
    adapter.save_adapted_data(adapted_df, output_path)
    
    # Step 3: Train
    print("\n Training ML models...")
    trainer = ModelTrainer(output_path)
    results = trainer.run_full_pipeline()
    
    # Step 4: Show results
    print("\n" + "="*60)
    print(" MODEL PERFORMANCE RESULTS")
    print("="*60)
    
    best_class = results['best_models']['classification']
    best_reg = results['best_models']['regression']
    
    print(f"\n Classification ({best_class['name']}):")
    print(f"   Accuracy:  {best_class['metrics']['accuracy']:.2%}")
    print(f"   Precision: {best_class['metrics']['precision']:.2%}")
    print(f"   Recall:    {best_class['metrics']['recall']:.2%}")
    print(f"   F1-Score:  {best_class['metrics']['f1_score']:.2%}")
    print(f"   ROC-AUC:   {best_class['metrics']['roc_auc']:.2%}")
    
    print(f"\n Regression ({best_reg['name']}):")
    print(f"   RMSE: {best_reg['metrics']['rmse']:.4f}")
    print(f"   MAE:  {best_reg['metrics']['mae']:.4f}")
    print(f"   R²:   {best_reg['metrics']['r2']:.4f}")
    
    # Step 5: Run sample predictions
    print("\n" + "="*60)
    print(" SAMPLE PREDICTIONS")
    print("="*60)
    
    model = MLRiskModel()
    
    # Get 5 random samples
    samples = adapted_df.sample(n=min(5, len(adapted_df)), random_state=42)
    
    for idx, row in samples.iterrows():
        sample_dict = row.to_dict()
        prediction = model.predict({'traditional_data': sample_dict, 'alternative_data': sample_dict})
        
        actual = row.get('risk_score', 'N/A')
        predicted = prediction['risk_score']
        category = prediction['risk_category']
        confidence = prediction['confidence']
        
        print(f"\n   Sample {idx}:")
        print(f"     Actual Risk:    {actual:.3f}" if isinstance(actual, float) else f"     Actual Risk: {actual}")
        print(f"     Predicted Risk: {predicted:.3f}")
        print(f"     Category:       {category}")
        print(f"     Confidence:     {confidence:.1%}")
    
    # Final summary
    elapsed = time.time() - start
    
    print("\n" + "="*60)
    print(" DEMO COMPLETE!")
    print("="*60)
    print(f"\n Total Time: {elapsed:.1f} seconds")
    print(f" Records Processed: {len(adapted_df):,}")
    print(f" Model Accuracy: {best_class['metrics']['accuracy']:.1%}")
    print(f" ROC-AUC: {best_class['metrics']['roc_auc']:.1%}")
    print(f"\n System ready! Start server: uvicorn main:app --reload")


def main():
    parser = argparse.ArgumentParser(description="Demo with judges' dataset")
    parser.add_argument('data', help='Path to judges dataset')
    
    args = parser.parse_args()
    run_demo(args.data)


if __name__ == "__main__":
    main()