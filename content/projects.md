# Projects

## Adversarial Robustness in Deep Neural Networks
[cite_start]**Timeline:** March 2026 - April 2026 [cite: 1047]
[cite_start]**Mentorship:** Prof. Siddhartha Gadgil, Indian Institute of Science [cite: 1044, 1045]

* [cite_start]Analyzed adversarial transferability across five different CNN architectures (ResNet18, ResNet34, VGG11, VGG16, and DenseNet121) trained on the CIFAR-10 dataset[cite: 31, 1048, 1085].
* [cite_start]Implemented Projected Gradient Descent (PGD) attacks with bounded perturbations to generate adversarial examples and evaluate cross-model fooling rates[cite: 35, 1048, 1086].
* [cite_start]Discovered that adversarial transferability is highly asymmetric; for example, perturbations generated on ResNet models transfer well to VGG models, but the reverse is significantly weaker[cite: 57, 366, 370].
* [cite_start]Identified gradient norm differences as the dominant predictor of transfer asymmetry, proving that transfer strength scales with the gradient norm ratio, while gradient cosine similarity showed no meaningful correlation[cite: 150, 171, 404, 433].
* [cite_start]Explored Incremental Adversarial Training (IncAT) combined with diffusion-based synthetic data as a defense strategy[cite: 11, 284, 1088].
* [cite_start]Demonstrated that while applying Fisher Information Matrix regularization during IncAT successfully preserves a model's clean accuracy, it overly constrains the parameter flexibility needed to effectively learn robust decision boundaries against adversarial attacks[cite: 183, 208, 528].