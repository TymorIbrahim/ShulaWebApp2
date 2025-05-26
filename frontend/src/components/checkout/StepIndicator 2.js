import React from "react";
import "./StepIndicator.css";

const StepIndicator = ({ steps, currentStep, completedSteps }) => {
  return (
    <div className="step-indicator">
      <div className="steps-container">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isUpcoming = step.id > currentStep;

          return (
            <div key={step.id} className="step-wrapper">
              <div className={`step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${isUpcoming ? 'upcoming' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? (
                    <span className="step-check">✓</span>
                  ) : (
                    <span className="step-icon">{step.icon}</span>
                  )}
                </div>
                <div className="step-content">
                  <div className="step-number">שלב {step.id}</div>
                  <div className="step-title">{step.title}</div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`step-connector ${isCompleted ? 'completed' : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator; 