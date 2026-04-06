extends Node3D

# Foliage meshes to spawn
var tree_meshes: Array[Mesh] = []
var bush_meshes: Array[Mesh] = []
var grass_meshes: Array[Mesh] = []

# Materials for foliage
var tree_material: StandardMaterial3D
var bush_material: StandardMaterial3D
var grass_material: StandardMaterial3D

@export var spawn_area_size: float = 450.0  # Bigger world (was 90)
@export var tree_count: int = 300           # More trees (was 50)
@export var bush_count: int = 150           # More bushes (was 30)
@export var grass_count: int = 500          # More grass (was 100)
@export var min_distance_from_player: float = 15.0

func _ready():
	print("FoliageSpawner initializing...")
	
	# Create green materials
	create_green_materials()
	
	# Load foliage meshes
	load_foliage_meshes()
	
	# Wait a frame for everything to be ready
	await get_tree().process_frame
	
	# Spawn foliage
	spawn_foliage()

func create_green_materials():
	# Tree material - dark green
	tree_material = StandardMaterial3D.new()
	tree_material.albedo_color = Color(0.13, 0.55, 0.13)  # Forest green
	tree_material.roughness = 0.9
	tree_material.vertex_color_use_as_albedo = false
	
	# Bush material - medium green
	bush_material = StandardMaterial3D.new()
	bush_material.albedo_color = Color(0.2, 0.6, 0.2)  # Medium green
	bush_material.roughness = 0.8
	bush_material.vertex_color_use_as_albedo = false
	
	# Grass material - bright green
	grass_material = StandardMaterial3D.new()
	grass_material.albedo_color = Color(0.3, 0.8, 0.3)  # Bright green
	grass_material.roughness = 0.7
	grass_material.vertex_color_use_as_albedo = false

func load_foliage_meshes():
	var obj_path = "res://assets/foliage/Low_Poly_Foliage_Pack_001/OBJ Files/"
	
	# Load tree meshes
	for i in range(1, 7):
		var tree_path = obj_path + "Low_Poly_Tree_00" + str(i) + ".obj"
		var mesh = load_mesh(tree_path, tree_material)
		if mesh:
			tree_meshes.append(mesh)
	
	# Load bush meshes
	for i in range(1, 3):
		var bush_path = obj_path + "Low_Poly_Bush_00" + str(i) + ".obj"
		var mesh = load_mesh(bush_path, bush_material)
		if mesh:
			bush_meshes.append(mesh)
	
	# Load grass meshes
	for i in range(1, 3):
		var grass_path = obj_path + "Low_Poly_Grass_00" + str(i) + ".obj"
		var mesh = load_mesh(grass_path, grass_material)
		if mesh:
			grass_meshes.append(mesh)
	
	print("Loaded meshes - Trees: ", tree_meshes.size(), " Bushes: ", bush_meshes.size(), " Grass: ", grass_meshes.size())

func load_mesh(path: String, material: Material) -> Mesh:
	if not ResourceLoader.exists(path):
		print("File not found: ", path)
		return null
	
	var resource = load(path)
	if resource is Mesh:
		print("Loaded mesh: ", path)
		# Apply green material
		if material:
			resource.surface_set_material(0, material)
		return resource
	else:
		print("Unknown resource type for: ", path)
		return null

func spawn_foliage():
	if tree_meshes.size() == 0 and bush_meshes.size() == 0 and grass_meshes.size() == 0:
		print("WARNING: No foliage meshes loaded!")
		return
	
	var rng = RandomNumberGenerator.new()
	rng.randomize()
	
	# Get player position
	var player = get_node("../Player")
	var player_pos = Vector3.ZERO
	if player:
		player_pos = player.global_position
	
	var spawned_trees = 0
	var spawned_bushes = 0
	var spawned_grass = 0
	
	# Use multimesh for grass (optimized)
	if grass_meshes.size() > 0:
		spawned_grass = spawn_multimesh_foliage(grass_meshes, grass_count, rng, player_pos, 0.8, 1.2, "grass")
	
	# Spawn trees (with collision)
	for i in range(tree_count):
		if tree_meshes.size() > 0:
			var mesh = tree_meshes[rng.randi_range(0, tree_meshes.size() - 1)]
			var instance = create_tree_instance(mesh, rng, player_pos)
			if instance:
				add_child(instance)
				spawned_trees += 1
	
	# Spawn bushes
	for i in range(bush_count):
		if bush_meshes.size() > 0:
			var mesh = bush_meshes[rng.randi_range(0, bush_meshes.size() - 1)]
			var instance = create_bush_instance(mesh, rng, player_pos)
			if instance:
				add_child(instance)
				spawned_bushes += 1
	
	print("Spawned: ", spawned_trees, " trees, ", spawned_bushes, " bushes, ", spawned_grass, " grass (multimesh)")

func spawn_multimesh_foliage(meshes: Array[Mesh], count: int, rng: RandomNumberGenerator, player_pos: Vector3, min_scale: float, max_scale: float, type: String) -> int:
	"""Spawn many instances of foliage using MultiMesh for optimization"""
	var spawned = 0
	
	for mesh in meshes:
		var multimesh = MultiMesh.new()
		multimesh.transform_format = MultiMesh.TRANSFORM_3D
		multimesh.instance_count = count / meshes.size()
		multimesh.mesh = mesh
		
		var multimesh_instance = MultiMeshInstance3D.new()
		multimesh_instance.multimesh = multimesh
		
		for i in multimesh.instance_count:
			var pos = get_random_position(rng, player_pos)
			if pos != Vector3.ZERO:
				var scale_mult = rng.randf_range(min_scale, max_scale)
				var transform = Transform3D()
				transform = transform.rotated(Vector3.UP, rng.randf() * PI * 2)
				transform = transform.scaled(Vector3(scale_mult, scale_mult, scale_mult))
				transform.origin = pos
				multimesh.set_instance_transform(i, transform)
				spawned += 1
			else:
				# Hide instance if no valid position
				multimesh.set_instance_transform(i, Transform3D())
		
		add_child(multimesh_instance)
	
	return spawned

func create_tree_instance(mesh: Mesh, rng: RandomNumberGenerator, player_pos: Vector3) -> StaticBody3D:
	var pos = get_random_position(rng, player_pos)
	if pos == Vector3.ZERO:
		return null
	
	var static_body = StaticBody3D.new()
	
	var mesh_instance = MeshInstance3D.new()
	mesh_instance.mesh = mesh
	
	static_body.add_child(mesh_instance)
	static_body.position = pos
	static_body.rotation.y = rng.randf() * PI * 2
	
	var scale_mult = rng.randf_range(0.8, 1.8)  # Bigger variation for trees
	static_body.scale = Vector3(scale_mult, scale_mult, scale_mult)
	
	# Add collision
	var collision = CollisionShape3D.new()
	var box = BoxShape3D.new()
	box.size = Vector3(0.8, 6, 0.8) * scale_mult
	collision.shape = box
	collision.position.y = 3 * scale_mult
	static_body.add_child(collision)
	
	return static_body

func create_bush_instance(mesh: Mesh, rng: RandomNumberGenerator, player_pos: Vector3) -> MeshInstance3D:
	var pos = get_random_position(rng, player_pos)
	if pos == Vector3.ZERO:
		return null
	
	var instance = MeshInstance3D.new()
	instance.mesh = mesh
	instance.position = pos
	instance.rotation.y = rng.randf() * PI * 2
	
	var scale_mult = rng.randf_range(0.6, 1.2)
	instance.scale = Vector3(scale_mult, scale_mult, scale_mult)
	
	return instance

func get_random_position(rng: RandomNumberGenerator, avoid_pos: Vector3) -> Vector3:
	var attempts = 0
	var max_attempts = 30
	
	while attempts < max_attempts:
		var x = rng.randf_range(-spawn_area_size, spawn_area_size)
		var z = rng.randf_range(-spawn_area_size, spawn_area_size)
		var pos = Vector3(x, 0, z)
		
		var dist_from_player = Vector2(pos.x, pos.z).distance_to(Vector2(avoid_pos.x, avoid_pos.z))
		if dist_from_player > min_distance_from_player:
			return pos
		
		attempts += 1
	
	return Vector3.ZERO
