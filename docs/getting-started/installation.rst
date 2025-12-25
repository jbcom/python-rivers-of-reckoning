Installation Guide
==================

This guide covers how to set up the development environment for **Rivers of Reckoning** 
using the Pygame-ce architecture.

Prerequisites
=============

- **Python 3.10** or higher
- **pip** (Python package installer)

Installing Dependencies
=======================

The game depends on several key libraries:

- **pygame-ce**: The modern, community-enhanced version of Pygame.
- **pygbag**: For web deployment and browser compatibility.
- **opensimplex**: For procedural noise generation.
- **esper**: A lightweight Entity Component System (ECS).

You can install all dependencies using the following command:

.. code-block:: bash

   pip install pygame-ce pygbag opensimplex esper

Development Setup
=================

1. Clone the repository:

   .. code-block:: bash

      git clone https://github.com/jbcom/nodejs-rivers-of-reckoning.git
      cd nodejs-rivers-of-reckoning

2. Install the project in editable mode:

   .. code-block:: bash

      pip install -e .

3. Run the game locally:

   .. code-block:: bash

      python main.py

Web Deployment
==============

Rivers of Reckoning is designed with a "Web-First" approach, allowing it to run 
natively in modern browsers via WebAssembly.

Local Web Preview
-----------------

You can preview the web version of the game locally using **pygbag**:

.. code-block:: bash

   python -m pygbag .

This will start a local server (usually at ``http://localhost:8000``) where you 
can play the game in your browser.

Building for Production
-----------------------

To build the game for static hosting (e.g., GitHub Pages, Render, Netlify):

.. code-block:: bash

   python -m pygbag .

The build artifacts will be generated in the ``build/web`` directory.

Deploying to Render
-------------------

The repository includes a ``render.yaml`` blueprint for easy deployment:

1. Connect your GitHub repository to **Render.com**.
2. Render will automatically detect the blueprint and use the following build 
   command:

   .. code-block:: bash

      pip install pygame-ce pygbag opensimplex esper && pip install -e . && python -m pygbag .

3. Set the **Static Publish Path** to ``./build/web``.

Mobile Deployment
=================

For native mobile deployment (iOS/Android), we use **Capacitor** to wrap the web 
build.

1. Install Node.js dependencies:

   .. code-block:: bash

      pnpm install

2. Build the web version:

   .. code-block:: bash

      pnpm build

3. Sync with Capacitor:

   .. code-block:: bash

      npx cap sync
