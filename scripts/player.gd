extends CharacterBody3D

# Movement speeds - FASTER defaults
@export var walk_speed: float = 8.0      # Was 5.0 - now faster walking
@export var run_speed: float = 15.0      # Was 10.0 - now faster running  
@export var sprint_speed: float = 25.0   # Was 15.0 - now super fast sprint
@export var rotation_speed: float = 10.0

@onready var model = $Model

var current_speed: float = walk_speed
var animation_player: AnimationPlayer
var current_animation: String = ""
var is_sprinting: bool = false
var controls_enabled: bool = false

func _ready():
	print("Player initialized - Sprint mapped to H key")
	print("Speeds - Walk:", walk_speed, " Run:", run_speed, " Sprint:", sprint_speed)
	await get_tree().process_frame
	
	# Find AnimationPlayer in the loaded model
	if model:
		animation_player = find_animation_player(model)
		if animation_player:
			print("Found AnimationPlayer with animations: ", animation_player.get_animation_list())
			# Set animation to loop
			setup_animations()
			play_animation("Idle")
		else:
			print("WARNING: No AnimationPlayer found in character")

func setup_animations():
	"""Configure animations to loop properly"""
	if not animation_player:
		return
	
	var anim_list = animation_player.get_animation_list()
	for anim_name in anim_list:
		var anim = animation_player.get_animation(anim_name)
		if anim:
			# Set looping animations
			if anim_name in ["Idle", "Walking", "Running"]:
				anim.loop_mode = Animation.LOOP_LINEAR
				print("Set ", anim_name, " to loop")

func find_animation_player(node: Node) -> AnimationPlayer:
	"""Recursively find AnimationPlayer in the model"""
	if node is AnimationPlayer:
		return node
	
	for child in node.get_children():
		var result = find_animation_player(child)
		if result:
			return result
	
	return null

func _physics_process(delta: float):
	if not controls_enabled:
		velocity.x = 0
		velocity.z = 0
		if not is_on_floor():
			velocity.y -= 9.8 * delta
		else:
			velocity.y = 0
		move_and_slide()
		play_animation("Idle")
		set_animation_speed(1.0)
		return

	# Get input
	var input_dir = Vector3.ZERO
	input_dir.x = Input.get_action_strength("move_right") - Input.get_action_strength("move_left")
	input_dir.z = Input.get_action_strength("move_back") - Input.get_action_strength("move_forward")
	
	# Normalize input
	input_dir = input_dir.normalized()
	
	# Determine speed
	var old_speed = current_speed
	is_sprinting = false
	
	if Input.is_action_pressed("sprint") and input_dir.length() > 0.1:
		# H key sprint - fastest speed (only when moving)
		current_speed = sprint_speed
		is_sprinting = true
		if old_speed != sprint_speed:
			print("SPRINT ACTIVE - Speed:", sprint_speed)
	elif Input.is_action_pressed("run") and input_dir.length() > 0.1:
		# Shift run - medium speed
		current_speed = run_speed
		if old_speed != run_speed:
			print("RUN ACTIVE - Speed:", run_speed)
	else:
		# Normal walk (or idle)
		current_speed = walk_speed
		if old_speed != walk_speed and old_speed != 0:
			print("WALK - Speed:", walk_speed)
	
	# Calculate movement
	var target_velocity = input_dir * current_speed
	velocity.x = target_velocity.x
	velocity.z = target_velocity.z
	
	# Apply gravity
	if not is_on_floor():
		velocity.y -= 9.8 * delta
	else:
		velocity.y = 0
	
	# Move
	move_and_slide()
	
	# Handle animation and rotation
	if input_dir.length() > 0.1:
		# Rotate model to face movement direction
		var target_rotation = atan2(input_dir.x, input_dir.z)
		model.rotation.y = lerp_angle(model.rotation.y, target_rotation, rotation_speed * delta)
		
		# Play movement animation based on speed
		if is_sprinting:
			play_animation("Running")
			# Speed up animation for sprint feel
			set_animation_speed(1.5)
		elif current_speed == run_speed:
			play_animation("Running")
			set_animation_speed(1.2)
		else:
			play_animation("Walking")
			set_animation_speed(1.0)
	else:
		# Not moving - idle
		play_animation("Idle")
		set_animation_speed(1.0)

func set_animation_speed(speed: float):
	"""Set the playback speed of current animation"""
	if animation_player:
		animation_player.speed_scale = speed

func play_animation(anim_name: String):
	if not animation_player:
		return
	
	# Check if animation exists
	if animation_player.has_animation(anim_name):
		if current_animation != anim_name:
			animation_player.play(anim_name)
			current_animation = anim_name
			print("Playing animation: ", anim_name)
		else:
			# Same animation - make sure it's playing (for looping)
			if not animation_player.is_playing():
				animation_player.play(anim_name)
	else:
		# Try alternative names
		var alternatives = {
			"Idle": ["idle", "IDLE", "Standing", "standing"],
			"Walking": ["walk", "WALK", "Walking", "walking"],
			"Running": ["run", "RUN", "Running", "running"]
		}
		
		if alternatives.has(anim_name):
			for alt in alternatives[anim_name]:
				if animation_player.has_animation(alt):
					if current_animation != alt:
						animation_player.play(alt)
						current_animation = alt
						print("Playing animation (alt): ", alt)
					return
		
		# Log available animations once
		if current_animation == "":
			print("Animation '", anim_name, "' not found. Available: ", animation_player.get_animation_list())

func _input(event):
	if not controls_enabled:
		return

	if event.is_action_pressed("ui_cancel"):
		get_tree().quit()

func set_controls_enabled(enabled: bool) -> void:
	controls_enabled = enabled
