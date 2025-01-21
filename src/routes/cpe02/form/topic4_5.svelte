<script>
    export let project_problem,project_Objective,handleTab;
    
</script>

<div>
    
    <label for="text" class="block text-lg font-medium mt-3"
    >4. ที่มาและความสำคัญของปัญหา <b class="text-red-500">*</b>
  </label>

  <textarea
    id="editor"
    name="w3review"
    rows="10"
    cols="50"
    class="w-full p-2"
    required
    bind:value={project_problem}
    on:keydown={(event) =>
      handleTab(event, (value) => (project_problem = value))}
    placeholder="เขียนที่มาและความสำคัญของปัญหา..."
  ></textarea>

  <label for="text" class="block text-lg font-medium mt-3"
    >5. วัตถุประสงค์ของโครงงาน <b class="text-red-500">*</b>
  </label>

  <textarea
    id="editor"
    name="w3review"
    rows="7"
    cols="50"
    required
    class="w-full p-2"
    bind:value={project_Objective}
    on:keydown={(event) =>
      handleTab(event, (value) => (project_Objective = value))}
    placeholder="วัตถุประสงค์ของโครงงาน"
  ></textarea>
</div>