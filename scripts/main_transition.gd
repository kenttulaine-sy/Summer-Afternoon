extends Node3D

enum FlowState {
	INTRO,
	TRANSITIONING,
	GAMEPLAY
}

@export var zoom_duration: float = 3.2
@export var intro_zoom_scale: Vector3 = Vector3(1.08, 1.08, 1.08)

@onready var world_root: Node3D = $WorldRoot
@onready var intro_camera: Camera3D = $IntroCamera
@onready var gameplay_camera: Camera3D = $WorldRoot/Player/Camera3D
@onready var intro_ui: Control = $UILayer/IntroUI
@onready var title_label: Label = $UILayer/IntroUI/Hero/Title
@onready var walk_button: Button = $UILayer/IntroUI/Hero/GoForWalkButton
@onready var gameplay_ui: Control = $UILayer/GameplayUI
@onready var fade_rect: ColorRect = $UILayer/FadeRect
@onready var zoom_target: Marker3D = $WorldRoot/ZoomTarget
@onready var player: CharacterBody3D = $WorldRoot/Player

var state: FlowState = FlowState.INTRO
var _transition_tween: Tween

func _ready() -> void:
	_set_state(FlowState.INTRO)
	walk_button.pressed.connect(_on_go_for_walk_pressed)

func _set_state(next_state: FlowState) -> void:
	state = next_state

	if state == FlowState.INTRO:
		intro_ui.visible = true
		intro_ui.modulate.a = 1.0
		title_label.modulate.a = 1.0
		walk_button.modulate.a = 1.0
		walk_button.disabled = false
		walk_button.focus_mode = Control.FOCUS_ALL
		fade_rect.modulate.a = 0.0
		fade_rect.visible = false
		gameplay_ui.visible = false
		intro_camera.current = true
		gameplay_camera.current = false
		world_root.scale = Vector3.ONE
		if player.has_method("set_controls_enabled"):
			player.call("set_controls_enabled", false)
	elif state == FlowState.TRANSITIONING:
		walk_button.disabled = true
		walk_button.focus_mode = Control.FOCUS_NONE
		if player.has_method("set_controls_enabled"):
			player.call("set_controls_enabled", false)
	elif state == FlowState.GAMEPLAY:
		intro_ui.visible = false
		gameplay_ui.visible = true
		intro_camera.current = false
		gameplay_camera.current = true
		world_root.scale = Vector3.ONE
		if player.has_method("set_controls_enabled"):
			player.call("set_controls_enabled", true)

func _on_go_for_walk_pressed() -> void:
	if state != FlowState.INTRO:
		return

	_set_state(FlowState.TRANSITIONING)
	_start_transition_sequence()

func _start_transition_sequence() -> void:
	if is_instance_valid(_transition_tween):
		_transition_tween.kill()

	var mobile_zoom_scale := Vector3(1.03, 1.03, 1.03)
	var chosen_scale := intro_zoom_scale
	if get_viewport().size.x < 900:
		chosen_scale = mobile_zoom_scale

	fade_rect.visible = true
	fade_rect.modulate.a = 0.0

	_transition_tween = create_tween()
	_transition_tween.set_parallel(true)
	_transition_tween.set_trans(Tween.TRANS_SINE)
	_transition_tween.set_ease(Tween.EASE_IN_OUT)

	_transition_tween.tween_property(title_label, "modulate:a", 0.0, 0.9)
	_transition_tween.tween_property(walk_button, "modulate:a", 0.0, 0.9)
	_transition_tween.tween_property(world_root, "scale", chosen_scale, zoom_duration)
	_transition_tween.tween_property(intro_camera, "global_position", zoom_target.global_position, zoom_duration)

	var focus_basis := Basis.looking_at((zoom_target.global_position - intro_camera.global_position).normalized(), Vector3.UP)
	_transition_tween.tween_property(intro_camera, "global_basis", focus_basis, zoom_duration)

	await _transition_tween.finished

	var crossfade_tween := create_tween()
	crossfade_tween.set_trans(Tween.TRANS_SINE)
	crossfade_tween.set_ease(Tween.EASE_IN_OUT)
	crossfade_tween.tween_property(fade_rect, "modulate:a", 1.0, 0.45)
	await crossfade_tween.finished

	_set_state(FlowState.GAMEPLAY)
	var reveal_tween := create_tween()
	reveal_tween.set_trans(Tween.TRANS_SINE)
	reveal_tween.set_ease(Tween.EASE_OUT)
	reveal_tween.tween_property(fade_rect, "modulate:a", 0.0, 0.45)
	await reveal_tween.finished
	fade_rect.visible = false
