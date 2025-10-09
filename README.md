**Restarting the Setup After a Reboot**
    ```
    open -a Docker && sleep 10 && docker-compose up -w
    ```

***
**Summary: To Pick Up Where You Left Off After Restart**

1.  **Open VSCode** and navigate to your project folder.
2.  **Start Docker** (if it’s not already running).
3.  **Run** `docker-compose up` to start your Docker container and Parcel dev server.
4.  (optional?) **Reattach VSCode** to the running container by using the **Dev-Containers** extension (via Command Palette > "Attach to Running Container").
5.  **Edit your files** inside VSCode, and see the live changes in your browser [http://localhost:1234](http://localhost:1234).
6. Commit locally
7. Publish to Github repo

***

### Step 1: Reopen VSCode and Your Project Folder

1.  Open **VSCode** on your computer.
2.  Use **File > Open Folder** and navigate to your **project directory** (the folder where you have your Docker setup, `docker-compose.yml`, `Dockerfile`, and project files).

***

### Step 2: Start Docker and Your Container

After your computer restarts, **Docker** will not automatically start the containers unless you configured it to. So, you need to start your **Docker container** manually again.

#### Start Docker (if not already running):

1.  If Docker is not already running on your machine, open **Docker Desktop** or start the Docker daemon in your terminal.
*   On **macOS** or **Windows**, just open the **Docker Desktop** application.
*   On **Linux**, start the Docker service with:
    ```
    open -a Docker
    ```

#### Start the Container with Docker Compose:

1.  Open your **VSCode terminal** (or use a separate terminal window).
2.  In your project directory, run:
    ```
    docker-compose up
    ```

This will start up your **Parcel development environment** inside the Docker container.

*   **Parcel** will start running, and it will listen on port `1234`. Your app will be available at `http://localhost:1234`.
*   **If you want to force a rebuild** of the container (which may be helpful if you've made changes to your Dockerfile or other configurations), run:
    ```
    docker-compose up --build --force-recreate
    ```

***

### Step 3: Attach to the Running Docker Container in VSCode

Now, let's **reconnect VSCode to the running container**.

1.  In **VSCode**, press `Ctrl + Shift + P` (or `Cmd + Shift + P` on macOS) to open the **Command Palette**.
2.  Type **“Dev-Containers: Attach to Running Container”** and select it.
3.  A list of running containers will appear. Select the **container for your Parcel app** (it will likely be named something like `d3-parcel-app-1`).
4.  **VSCode will automatically connect** to the container, and you should see your project files in the Explorer panel on the left side.

***

### Step 4: Start Editing in VSCode

Once connected:

*   **You can edit your project files** (`index.html`, `script.js`, etc.) as usual, and any changes will be reflected in the running container.
*   **Parcel will automatically reload** your app in the browser (`http://localhost:1234`) whenever you save a file.

***

### Step 5: Access Your App in the Browser

*   Open a browser and navigate to **`http://localhost:1234`** to see your app live.
*   As long as **Parcel** is running in the container, you should be able to see your app updated in real-time as you edit files.

***

### Step 6: Stopping the Container (If You Need To)

When you're done for the day, if you want to stop the container and Docker:

1.  **Stop the container** by pressing `CTRL + C` in the terminal where you ran `docker-compose up`.
2.  To fully **stop and remove the container**, run:
    ```
    docker-compose down
    ```

    This will stop and remove the containers, networks, and volumes defined in your docker-compose.yml.

***

### Step 7: Commit locally

When you're done for the day, make sure to save the changes by committing locally:

1.  Click to the Source Control tab (left panel, 3rd one down, branched metro-like lines with 3 circles).
2.  Type a description
3.  Click Commit.

    This will stop and remove the containers, networks, and volumes defined in your docker-compose.yml.

***

### Step 8: Publish to Github repo

You may also want to build a custom version for github and deploy it:

1.  Ensure the docker-compose is down (step 6).
2.  In the terminal, type and hit Enter:
    ```
    npm run deploy
    ```

3.  Check on the progress at **`https://github.com/radogit/cocoarui/deployments/github-pages`**. Be patient, it may take a few minutes to appear.

    The public version should be available at **`https://radogit.github.io/cocoarui/`**.


***

### Step 9: Renew Access Token (Classic) (optional, only when required, when old access token expired)

Personal Access Tokens (Classic) tend to have expiry limits. In such cases deployments through above commands (dependent on gh-pages) may fail. To re-authenticate:

1.  go to Github > top-right corner > Settings > Developer Settings > Personal access token > Tokens (classic) (**`github.com/settings/tokens`**)
2.  Hit [Generate new token] > Generate New Token (classic)
3.  Give it a name, and check at least 'repo' as permissions.
4.  Make sure to copy the provided token string, as it is only provided once.
5.  Over in VS Code, in Terminal, type:
    ```
    git remote set-url origin https://radogit:<-accessTokenString->@github.com/radogit/cocoarui.git
    ```
    