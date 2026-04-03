import numpy as np
import pandas as pd
import os
import json
import pickle
from datetime import datetime
from typing import Dict, Any, Tuple, List

from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report,
    mean_squared_error, mean_absolute_error, r2_score
)
from xgboost import XGBClassifier, XGBRegressor

from .synthetic_data import generate_and_save_dataset, InsuranceDataGenerator
from .feature_engineering import FeatureEngineer


class ModelTrainer:
    """
    Comprehensive ML model training pipeline.
    
    Trains multiple models:
    - Random Forest
    - XGBoost
    - Gradient Boosting
    - Logistic Regression
    
    For both:
    - Classification (high risk / low risk)
    - Regression (risk score prediction)
    """
    
    def __init__(self, data_path: str = None):
        self.data_path = data_path
        self.feature_engineer = FeatureEngineer()
        self.models = {}
        self.metrics = {}
        self.best_model = None
        self.best_model_name = None
        
    def load_data(self, generate_if_missing: bool = True) -> pd.DataFrame:
        """Load training data."""
        
        if self.data_path and os.path.exists(self.data_path):
            print(f" Loading dataset from {self.data_path}")
            df = pd.read_csv(self.data_path)
        elif generate_if_missing:
            print(" Generating new dataset...")
            df = generate_and_save_dataset(10000)
        else:
            raise FileNotFoundError("Dataset not found and generation disabled")
        
        print(f" Loaded {len(df)} records")
        return df
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """Prepare features and split data."""
        
        print(" Preparing features...")
        
        # Fit and transform features
        X = self.feature_engineer.fit_transform(df)
        
        # Get targets
        y_classification = df['is_high_risk'].values
        y_regression = df['risk_score'].values
        
        # Split data
        X_train, X_test, y_class_train, y_class_test, y_reg_train, y_reg_test = train_test_split(
            X, y_classification, y_regression,
            test_size=0.2, 
            random_state=42,
            stratify=y_classification
        )
        
        print(f" Training set: {len(X_train)} samples")
        print(f" Test set: {len(X_test)} samples")
        
        return (X_train, X_test, 
                y_class_train, y_class_test, 
                y_reg_train, y_reg_test)
    
    def train_classification_models(
        self, 
        X_train: np.ndarray, 
        X_test: np.ndarray,
        y_train: np.ndarray, 
        y_test: np.ndarray
    ) -> Dict[str, Any]:
        """Train classification models for high/low risk prediction."""
        
        print("\n" + "="*60)
        print(" TRAINING CLASSIFICATION MODELS")
        print("="*60)
        
        models = {
            'random_forest': RandomForestClassifier(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            ),
            'xgboost': XGBClassifier(
                n_estimators=100,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                use_label_encoder=False,
                eval_metric='logloss'
            ),
            'gradient_boosting': GradientBoostingClassifier(
                n_estimators=100,
                max_depth=8,
                learning_rate=0.1,
                random_state=42
            ),
            'logistic_regression': LogisticRegression(
                max_iter=1000,
                random_state=42
            )
        }
        
        results = {}
        
        for name, model in models.items():
            print(f"\n Training {name}...")
            
            # Train model
            model.fit(X_train, y_train)
            
            # Predictions
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]
            
            # Calculate metrics
            metrics = {
                'accuracy': accuracy_score(y_test, y_pred),
                'precision': precision_score(y_test, y_pred),
                'recall': recall_score(y_test, y_pred),
                'f1_score': f1_score(y_test, y_pred),
                'roc_auc': roc_auc_score(y_test, y_prob),
                'confusion_matrix': confusion_matrix(y_test, y_pred).tolist()
            }
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train, y_train, cv=5)
            metrics['cv_mean'] = cv_scores.mean()
            metrics['cv_std'] = cv_scores.std()
            
            results[name] = {
                'model': model,
                'metrics': metrics
            }
            
            print(f"   Accuracy: {metrics['accuracy']:.4f}")
            print(f"   ROC-AUC: {metrics['roc_auc']:.4f}")
            print(f"   F1-Score: {metrics['f1_score']:.4f}")
            print(f"   CV Score: {metrics['cv_mean']:.4f} (+/- {metrics['cv_std']:.4f})")
        
        return results
    
    def train_regression_models(
        self,
        X_train: np.ndarray,
        X_test: np.ndarray,
        y_train: np.ndarray,
        y_test: np.ndarray
    ) -> Dict[str, Any]:
        """Train regression models for risk score prediction."""
        
        print("\n" + "="*60)
        print(" TRAINING REGRESSION MODELS")
        print("="*60)
        
        models = {
            'rf_regressor': RandomForestRegressor(
                n_estimators=100,
                max_depth=15,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            ),
            'xgb_regressor': XGBRegressor(
                n_estimators=100,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                random_state=42
            )
        }
        
        results = {}
        
        for name, model in models.items():
            print(f"\n Training {name}...")
            
            # Train
            model.fit(X_train, y_train)
            
            # Predict
            y_pred = model.predict(X_test)
            
            # Metrics
            metrics = {
                'mse': mean_squared_error(y_test, y_pred),
                'rmse': np.sqrt(mean_squared_error(y_test, y_pred)),
                'mae': mean_absolute_error(y_test, y_pred),
                'r2': r2_score(y_test, y_pred)
            }
            
            results[name] = {
                'model': model,
                'metrics': metrics
            }
            
            print(f"   RMSE: {metrics['rmse']:.4f}")
            print(f"   MAE: {metrics['mae']:.4f}")
            print(f"   R²: {metrics['r2']:.4f}")
        
        return results
    
    def get_feature_importance(
        self, 
        model, 
        feature_names: List[str]
    ) -> pd.DataFrame:
        """Extract feature importance from trained model."""
        
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
        elif hasattr(model, 'coef_'):
            importance = np.abs(model.coef_[0])
        else:
            return None
        
        df = pd.DataFrame({
            'feature': feature_names,
            'importance': importance
        }).sort_values('importance', ascending=False)
        
        return df
    
    def select_best_model(
        self, 
        classification_results: Dict,
        regression_results: Dict
    ) -> Tuple[str, Any]:
        """Select best performing model."""
        
        print("\n" + "="*60)
        print(" SELECTING BEST MODEL")
        print("="*60)
        
        # For classification, use ROC-AUC as primary metric
        best_class_name = max(
            classification_results.keys(),
            key=lambda k: classification_results[k]['metrics']['roc_auc']
        )
        best_class_score = classification_results[best_class_name]['metrics']['roc_auc']
        
        # For regression, use R² as primary metric
        best_reg_name = max(
            regression_results.keys(),
            key=lambda k: regression_results[k]['metrics']['r2']
        )
        best_reg_score = regression_results[best_reg_name]['metrics']['r2']
        
        print(f"\n Best Classification Model: {best_class_name}")
        print(f"   ROC-AUC: {best_class_score:.4f}")
        
        print(f"\n Best Regression Model: {best_reg_name}")
        print(f"   R² Score: {best_reg_score:.4f}")
        
        # We'll use the classification model as primary (for approve/decline)
        # and regression model for risk score
        return {
            'classification': {
                'name': best_class_name,
                'model': classification_results[best_class_name]['model'],
                'metrics': classification_results[best_class_name]['metrics']
            },
            'regression': {
                'name': best_reg_name,
                'model': regression_results[best_reg_name]['model'],
                'metrics': regression_results[best_reg_name]['metrics']
            }
        }
    
    def save_models(
        self,
        best_models: Dict,
        classification_results: Dict,
        regression_results: Dict,
        output_dir: str = None
    ):
        """Save trained models and metrics."""
        
        if output_dir is None:
            output_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        
        os.makedirs(output_dir, exist_ok=True)
        
        print("\n Saving models...")
        
        # Save best models
        model_path = os.path.join(output_dir, 'trained_model.pkl')
        with open(model_path, 'wb') as f:
            pickle.dump({
                'classification_model': best_models['classification']['model'],
                'regression_model': best_models['regression']['model'],
                'classification_name': best_models['classification']['name'],
                'regression_name': best_models['regression']['name']
            }, f)
        print(f"    Models saved to {model_path}")
        
        # Save feature engineer
        fe_path = os.path.join(output_dir, 'feature_scaler.pkl')
        self.feature_engineer.save(fe_path)
        
        # Save metrics
        all_metrics = {
            'training_date': datetime.now().isoformat(),
            'best_classification_model': best_models['classification']['name'],
            'best_regression_model': best_models['regression']['name'],
            'classification_metrics': {
                name: {
                    k: v for k, v in results['metrics'].items()
                    if k != 'confusion_matrix'
                }
                for name, results in classification_results.items()
            },
            'regression_metrics': {
                name: results['metrics']
                for name, results in regression_results.items()
            },
            'feature_importance': self.get_feature_importance(
                best_models['classification']['model'],
                self.feature_engineer.get_feature_names()
            ).head(15).to_dict('records') if hasattr(
                best_models['classification']['model'], 'feature_importances_'
            ) else None
        }
        
        metrics_path = os.path.join(output_dir, 'training_metrics.json')
        with open(metrics_path, 'w') as f:
            json.dump(all_metrics, f, indent=2)
        print(f"    Metrics saved to {metrics_path}")
        
        return model_path, fe_path, metrics_path
    
    def run_full_pipeline(self) -> Dict[str, Any]:
        """Run the complete training pipeline."""
        
        print("\n" + "="*60)
        print(" STARTING FULL TRAINING PIPELINE")
        print("="*60)
        
        # Load data
        df = self.load_data()
        
        # Prepare data
        (X_train, X_test, 
         y_class_train, y_class_test,
         y_reg_train, y_reg_test) = self.prepare_data(df)
        
        # Train classification models
        class_results = self.train_classification_models(
            X_train, X_test, y_class_train, y_class_test
        )
        
        # Train regression models
        reg_results = self.train_regression_models(
            X_train, X_test, y_reg_train, y_reg_test
        )
        
        # Select best models
        best_models = self.select_best_model(class_results, reg_results)
        
        # Save everything
        paths = self.save_models(best_models, class_results, reg_results)
        
        print("\n" + "="*60)
        print(" TRAINING PIPELINE COMPLETE!")
        print("="*60)
        
        # Print summary
        print("\n SUMMARY:")
        print(f"   Dataset size: {len(df)} records")
        print(f"   Best classification model: {best_models['classification']['name']}")
        print(f"   Classification ROC-AUC: {best_models['classification']['metrics']['roc_auc']:.4f}")
        print(f"   Best regression model: {best_models['regression']['name']}")
        print(f"   Regression R²: {best_models['regression']['metrics']['r2']:.4f}")
        
        return {
            'best_models': best_models,
            'classification_results': class_results,
            'regression_results': reg_results,
            'paths': paths
        }


def main():
    """Main entry point for training."""
    
    # Check if data exists
    data_path = os.path.join(
        os.path.dirname(__file__), 
        '..', 'data', 
        'insurance_dataset.csv'
    )
    
    trainer = ModelTrainer(data_path)
    results = trainer.run_full_pipeline()
    
    print("\n Training complete! Models are ready for deployment.")
    
    return results


if __name__ == "__main__":
    main()