#!/bin/bash
# Apply module/size/criticality/owner/risk labels to Linear issues
# Based on plan: /Users/cianosullivan/.claude/plans/squishy-growing-moore.md

TOKEN="lin_api_G6zrg0JPXgnzh3Y5O0m2TITtXMCHfCETHdPxS9dl"

add_label() {
  local issue_id=$1
  local label_id=$2

  result=$(/usr/bin/curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: $TOKEN" \
    -d "{\"query\": \"mutation { issueAddLabel(id: \\\"$issue_id\\\", labelId: \\\"$label_id\\\") { success } }\"}" \
    https://api.linear.app/graphql)

  echo "$result" | jq -r '.data.issueAddLabel.success // .errors'
}

# Label IDs
M1="81b42bd2-b7f0-49a7-8e66-2d71334e11e8"  # module:1-infra
M2="e583e99d-9283-4632-bcb9-1f8a2ed43484"  # module:2-safety
M3="e2d050b6-860f-4322-a125-2a4223054ded"  # module:3-research
M4="4b9c7c01-ebae-46fb-8e2c-0ee0a7f6045d"  # module:4-ui
M5="69410b10-f080-4110-89f5-73f325459eaa"  # module:5-avatar
M6="322e8d74-8044-433d-966b-f13366e88e5a"  # module:6-network
M7="93bd5c49-d6fc-4812-b715-c8d003ef04d2"  # module:7-viz
M8="a77dedc8-1178-4e0f-b843-2f35f13cca5c"  # module:8-analytics
M9="1f77020d-638d-4490-9e41-f8cbbc23cebe"  # module:9-assessment
M10="e10077d1-4379-4368-bb88-c7cdca6df92a" # module:10-rag
M11="1a97d971-49c6-45c0-bc70-64cfe2c863f7" # module:11-features
M12="d80149bf-3db1-4a89-b1cf-22c3de2f82ae" # module:12-clinical
MA="2a945181-f943-40cd-9533-f143647434cc"  # module:academic
MD="4463e827-a2d8-4e4b-b88c-fb71ef2322f0"  # module:deferred

SXS="af4304d9-adda-4f07-a532-21460a997903" # size:XS
SS="7b509155-17ac-4e2d-a02a-4bbb939c23a5"  # size:S
SM="2ab696de-0c14-430b-a6a3-95ce177ef19e"  # size:M
SL="4b67803a-dd2f-4935-893b-a2c12b840ef9"  # size:L
SXL="857e16e4-c8d8-4dbc-ab49-ff535e89589c" # size:XL
SXXL="387288c5-9f2b-4bec-84bc-e91ae26e8fe8" # size:XXL

CC="31fd2c11-94fa-4731-8299-2d74d3909d3b"  # criticality:critical
CH="5e96bd65-a20a-4c18-8873-a356a6077d58"  # criticality:high
CM="e515a939-019c-452a-b3bf-a7ad1bdc2c04"  # criticality:medium
CL="b15cea6b-d0af-40be-b6f6-da91157c7ad2"  # criticality:low

OC="dab9bfdf-ed93-4184-b526-75dbe8785c9c"  # owner:claude
ON="ad8efee0-0f1e-42f9-959a-124f56318beb"  # owner:cian
OB="5a3bb981-a217-4828-8ea4-f9dd72b229a3"  # owner:collab

RS="a86452d4-8548-4c4b-8e2b-05e9fb0072bf"  # risk:spike
RR="819a4783-8e19-4575-a62a-ae80443aca88"  # risk:research
RE="4ec62d48-6f7b-4700-9c31-4d2ae4d365d2"  # risk:external
RC="e6b17ee4-a85f-4bf7-b152-f2d0a01f1bd2"  # risk:cost

# Issue IDs
I5="246359b6-b312-438f-9b2c-66a4497b9a6d"
I6="01101407-5273-4fa1-a59a-c7365be12d68"
I7="54dc109b-4bb5-432a-96bd-793bee8d0d51"
I8="65a812e9-4c1a-40e4-a221-9f3ff1b60530"
I9="8eaf34ba-ffe1-463c-8a0c-60dc9743498e"
I10="cc2dd6a2-c494-4dfb-9136-02caa73cd881"
I11="5362fe5c-70a9-4a44-a1fd-a814f0d33f45"
I12="0aa076ea-3772-4ab8-bb09-a2ea092df08a"
I13="f77c3883-1173-4bca-9fb0-d281f4a47644"
I14="2cb1822a-6cb3-479f-b730-2d939195f185"
I15="231fde2b-0f03-45ea-8839-2f1ff8e93884"
I16="f0114619-15e8-491a-a544-aa6702a25b0f"
I17="f58bfc98-4307-4749-b439-42a8c93125b4"
I18="96c538b4-9495-452b-9c37-28224770029d"
I23="6691ff68-dcae-4b58-8e8a-640bff4b6b40"
I31="930c2df3-1962-4615-8c6d-7a8a3ec5252a"
I32="2ff894f1-b794-4b97-b6dd-f3688a2d1155"
I33="3906cf46-356c-460a-8d64-5383a5bfe6f5"
I34="3359b8a2-d2c1-4c83-a231-5daf63791650"
I35="090c530a-40ad-4f81-bdaf-23d7c159be09"
I37="67fc4504-38b1-4147-99b2-bd539d8f8ac8"
I38="3886d73b-ceb3-46c2-9f90-3db489cb2564"
I39="f884d465-9e8d-461b-8ad2-791556d03a9d"
I40="e59135ec-e713-42e1-971d-c3ac9eeef397"
I41="75350df5-50c5-4c80-bd3f-29e8aaf83c17"
I42="ab4e5286-12c6-4753-947f-019bdd1d7a18"
I43="9f8729e0-fb44-4aac-9515-54723a93b2bb"
I44="0eeaa7ca-340c-43e6-aa49-d58863a3bce2"
I45="94122c4e-8bdb-4b4c-9f87-4ac519dcd075"
I46="37be5380-a175-4bbe-b5ad-aefa47745786"
I47="37769da7-5b1d-4b12-9c63-865d096ec178"
I48="3a404773-a565-466f-977c-8a890b77c946"
I50="9a943741-6ffd-4681-b171-b80fc343ec05"
I52="2b12715e-4dd8-416e-9e23-2512d3d73e65"
I53="7c8eca9c-3008-4e05-b563-e4948c73845e"
I54="6e057779-4e76-41d4-b692-40b6250e8fce"
I55="8bd39232-17a9-4797-bef6-91f8d6f484a8"
I59="527a01a9-7605-4288-82cc-348e758989ba"
I60="9f3da2c6-4604-40ed-8305-18710fe923eb"
I62="1ab8ca6a-1909-4d53-9fed-2cb2671dbb03"
I63="2bac0df8-bc94-4856-aee7-8fb78d9b49eb"
I64="67d08e3e-f813-4371-b40e-707aadc13b18"
I65="bb3112f8-8553-4851-9ade-582a0eed5b89"
I66="c3b39faf-7a29-4cdd-b876-1ff8e5983011"
I67="964d7d43-c3c4-407a-8c92-63d3cb1efb7d"
I69="3722d406-c616-4fbd-8148-b12f6c2fef83"
I70="3c21d4e4-cd70-4d68-af91-5a36462213b9"
I72="2431b0b1-64d3-48b0-ac15-74c734aecc51"
I75="987d0b2b-a38e-4a6d-8223-65a642e2beeb"
I80="48b442e0-4ab8-4a9e-b749-856ec329fc34"
I82="9605d1ee-6fdb-438b-82b8-84972f574118"
I83="a9cbed47-ad1c-4421-adcc-59d019623b2f"
I84="aa261784-d43e-493e-bbb4-984317b1ea6f"
I85="4c7f11b5-9699-4ca7-9176-ea2530ec0d1a"
I86="4dedeb9d-21fc-4a35-ae13-e44d41f9cf77"
I87="36e8c3e7-7ccc-4485-a393-5786cfa02506"
I88="172d91be-c412-481d-945c-b47ebd57b29f"
I89="0007ff0b-6127-491d-9e2c-12d857cd9da1"
I90="afb59adb-8481-48ba-a4bd-e242b1fd3ce8"
I91="bd260300-78d3-42c5-b326-5599556e3f4b"
I92="0237d84f-31e6-4574-98a3-2a3443a6b754"
I93="34a8f96d-c7ad-489f-90e2-b0077dd26d5c"
I94="89d6050e-c086-48a0-b3b1-fc3d63186df4"
I95="79c29fe5-c907-4020-9fe4-c82e5b54bb9c"
I96="c48ef2d5-6353-4eb2-bf6c-1c604f801468"
I97="e36b520a-a7f2-4389-9efe-08ef4e9111c5"
I98="6096dfd3-89ff-4b5a-8fbe-aa79ec670c6b"
I100="a62a4137-9fb8-4a95-9168-3a03083b816f"
I101="544e6bcc-6bd9-4c7d-b09e-b4ad63d1d35b"
I102="30f84faa-7c07-495c-8ae1-0e2a3be1969d"
I103="d729a983-33d6-4939-9628-2129f7db2e74"
I104="f0268dce-efd3-4a59-bc26-cad1d27c0feb"
I105="7b4fd892-d653-4aa6-9c3d-399355ac371f"
I106="c9079eb4-8966-4c59-a32f-576f14a49766"
I107="400b79c0-0c2b-48ef-96fe-270d54d3b443"
I108="6d75dda5-a5cd-4c6e-ae9c-606b0e7a5d7f"
I109="ba4f479f-5bfa-4d7d-aa01-a0de921978f3"
I110="292a8975-f5c5-422a-ad3a-1874d9c45333"
I111="63e82759-c31c-4b42-81eb-0ea5b621a219"
I112="2909c622-1110-42aa-8844-43e9c529a45b"
I113="39f6b094-b947-45f1-be9d-75c09485fbcd"

MODULE=$1

case $MODULE in
  2)
    echo "=== Module 2: Safety & Compliance ==="
    # CIA-88: S, critical, claude
    add_label "$I88" "$M2"
    add_label "$I88" "$SS"
    add_label "$I88" "$CC"
    add_label "$I88" "$OC"

    # CIA-84: M, critical, collab, research
    add_label "$I84" "$M2"
    add_label "$I84" "$SM"
    add_label "$I84" "$CC"
    add_label "$I84" "$OB"
    add_label "$I84" "$RR"

    # CIA-90: M, high, collab
    add_label "$I90" "$M2"
    add_label "$I90" "$SM"
    add_label "$I90" "$CH"
    add_label "$I90" "$OB"

    # CIA-66: M, critical, collab, research
    add_label "$I66" "$M2"
    add_label "$I66" "$SM"
    add_label "$I66" "$CC"
    add_label "$I66" "$OB"
    add_label "$I66" "$RR"

    # CIA-83: M, critical, claude, research
    add_label "$I83" "$M2"
    add_label "$I83" "$SM"
    add_label "$I83" "$CC"
    add_label "$I83" "$OC"
    add_label "$I83" "$RR"

    # CIA-64: L, high, collab, research
    add_label "$I64" "$M2"
    add_label "$I64" "$SL"
    add_label "$I64" "$CH"
    add_label "$I64" "$OB"
    add_label "$I64" "$RR"

    # CIA-85: M, medium, claude
    add_label "$I85" "$M2"
    add_label "$I85" "$SM"
    add_label "$I85" "$CM"
    add_label "$I85" "$OC"
    ;;

  3)
    echo "=== Module 3: Research Synthesis ==="
    # CIA-80: XL, critical, cian, research
    add_label "$I80" "$M3"
    add_label "$I80" "$SXL"
    add_label "$I80" "$CC"
    add_label "$I80" "$ON"
    add_label "$I80" "$RR"

    # CIA-52: M, critical, cian, research
    add_label "$I52" "$M3"
    add_label "$I52" "$SM"
    add_label "$I52" "$CC"
    add_label "$I52" "$ON"
    add_label "$I52" "$RR"

    # CIA-53: M, critical, cian, research
    add_label "$I53" "$M3"
    add_label "$I53" "$SM"
    add_label "$I53" "$CC"
    add_label "$I53" "$ON"
    add_label "$I53" "$RR"

    # CIA-54: M, critical, cian, research
    add_label "$I54" "$M3"
    add_label "$I54" "$SM"
    add_label "$I54" "$CC"
    add_label "$I54" "$ON"
    add_label "$I54" "$RR"

    # CIA-94: L, high, collab, research
    add_label "$I94" "$M3"
    add_label "$I94" "$SL"
    add_label "$I94" "$CH"
    add_label "$I94" "$OB"
    add_label "$I94" "$RR"

    # CIA-17: M, medium, cian, research
    add_label "$I17" "$M3"
    add_label "$I17" "$SM"
    add_label "$I17" "$CM"
    add_label "$I17" "$ON"
    add_label "$I17" "$RR"
    ;;

  4)
    echo "=== Module 4: UI/UX Core ==="
    # CIA-23: M, high, claude
    add_label "$I23" "$M4"
    add_label "$I23" "$SM"
    add_label "$I23" "$CH"
    add_label "$I23" "$OC"

    # CIA-89: L, high, collab, research
    add_label "$I89" "$M4"
    add_label "$I89" "$SL"
    add_label "$I89" "$CH"
    add_label "$I89" "$OB"
    add_label "$I89" "$RR"

    # CIA-92: M, medium, cian, research
    add_label "$I92" "$M4"
    add_label "$I92" "$SM"
    add_label "$I92" "$CM"
    add_label "$I92" "$ON"
    add_label "$I92" "$RR"

    # CIA-55: M, medium, collab, research
    add_label "$I55" "$M4"
    add_label "$I55" "$SM"
    add_label "$I55" "$CM"
    add_label "$I55" "$OB"
    add_label "$I55" "$RR"

    # CIA-87: M, medium, claude, research
    add_label "$I87" "$M4"
    add_label "$I87" "$SM"
    add_label "$I87" "$CM"
    add_label "$I87" "$OC"
    add_label "$I87" "$RR"

    # CIA-63: M, medium, cian, research
    add_label "$I63" "$M4"
    add_label "$I63" "$SM"
    add_label "$I63" "$CM"
    add_label "$I63" "$ON"
    add_label "$I63" "$RR"
    ;;

  5)
    echo "=== Module 5: Avatar & Voice ==="
    # CIA-47: M, medium, claude, external, spike
    add_label "$I47" "$M5"
    add_label "$I47" "$SM"
    add_label "$I47" "$CM"
    add_label "$I47" "$OC"
    add_label "$I47" "$RE"
    add_label "$I47" "$RS"

    # CIA-100: M, medium, claude, external, cost
    add_label "$I100" "$M5"
    add_label "$I100" "$SM"
    add_label "$I100" "$CM"
    add_label "$I100" "$OC"
    add_label "$I100" "$RE"
    add_label "$I100" "$RC"

    # CIA-101: M, medium, claude, external, cost
    add_label "$I101" "$M5"
    add_label "$I101" "$SM"
    add_label "$I101" "$CM"
    add_label "$I101" "$OC"
    add_label "$I101" "$RE"
    add_label "$I101" "$RC"

    # CIA-102: S, low, claude
    add_label "$I102" "$M5"
    add_label "$I102" "$SS"
    add_label "$I102" "$CL"
    add_label "$I102" "$OC"

    # CIA-82: L, medium, claude, external, spike
    add_label "$I82" "$M5"
    add_label "$I82" "$SL"
    add_label "$I82" "$CM"
    add_label "$I82" "$OC"
    add_label "$I82" "$RE"
    add_label "$I82" "$RS"
    ;;

  6)
    echo "=== Module 6: Network Analysis ==="
    # CIA-6: M, high, claude
    add_label "$I6" "$M6"
    add_label "$I6" "$SM"
    add_label "$I6" "$CH"
    add_label "$I6" "$OC"

    # CIA-7: M, high, claude
    add_label "$I7" "$M6"
    add_label "$I7" "$SM"
    add_label "$I7" "$CH"
    add_label "$I7" "$OC"

    # CIA-8: M, high, claude, research
    add_label "$I8" "$M6"
    add_label "$I8" "$SM"
    add_label "$I8" "$CH"
    add_label "$I8" "$OC"
    add_label "$I8" "$RR"

    # CIA-9: M, medium, claude
    add_label "$I9" "$M6"
    add_label "$I9" "$SM"
    add_label "$I9" "$CM"
    add_label "$I9" "$OC"

    # CIA-10: M, medium, claude, research
    add_label "$I10" "$M6"
    add_label "$I10" "$SM"
    add_label "$I10" "$CM"
    add_label "$I10" "$OC"
    add_label "$I10" "$RR"
    ;;

  7)
    echo "=== Module 7: Visualisation ==="
    # CIA-48: M, high, claude
    add_label "$I48" "$M7"
    add_label "$I48" "$SM"
    add_label "$I48" "$CH"
    add_label "$I48" "$OC"

    # CIA-11: M, medium, claude
    add_label "$I11" "$M7"
    add_label "$I11" "$SM"
    add_label "$I11" "$CM"
    add_label "$I11" "$OC"

    # CIA-12: M, medium, claude
    add_label "$I12" "$M7"
    add_label "$I12" "$SM"
    add_label "$I12" "$CM"
    add_label "$I12" "$OC"

    # CIA-13: M, medium, claude
    add_label "$I13" "$M7"
    add_label "$I13" "$SM"
    add_label "$I13" "$CM"
    add_label "$I13" "$OC"

    # CIA-14: M, medium, claude
    add_label "$I14" "$M7"
    add_label "$I14" "$SM"
    add_label "$I14" "$CM"
    add_label "$I14" "$OC"

    # CIA-18: M, medium, claude
    add_label "$I18" "$M7"
    add_label "$I18" "$SM"
    add_label "$I18" "$CM"
    add_label "$I18" "$OC"

    # CIA-60: M, low, claude, external
    add_label "$I60" "$M7"
    add_label "$I60" "$SM"
    add_label "$I60" "$CL"
    add_label "$I60" "$OC"
    add_label "$I60" "$RE"

    # CIA-50: M, low, claude
    add_label "$I50" "$M7"
    add_label "$I50" "$SM"
    add_label "$I50" "$CL"
    add_label "$I50" "$OC"
    ;;

  8)
    echo "=== Module 8: Analytics ==="
    # CIA-91: M, medium, collab, spike
    add_label "$I91" "$M8"
    add_label "$I91" "$SM"
    add_label "$I91" "$CM"
    add_label "$I91" "$OB"
    add_label "$I91" "$RS"

    # CIA-110: M, medium, collab, spike
    add_label "$I110" "$M8"
    add_label "$I110" "$SM"
    add_label "$I110" "$CM"
    add_label "$I110" "$OB"
    add_label "$I110" "$RS"

    # CIA-111: S, low, claude, external, cost
    add_label "$I111" "$M8"
    add_label "$I111" "$SS"
    add_label "$I111" "$CL"
    add_label "$I111" "$OC"
    add_label "$I111" "$RE"
    add_label "$I111" "$RC"

    # CIA-112: S, low, claude, external
    add_label "$I112" "$M8"
    add_label "$I112" "$SS"
    add_label "$I112" "$CL"
    add_label "$I112" "$OC"
    add_label "$I112" "$RE"

    # CIA-113: M, low, claude, spike
    add_label "$I113" "$M8"
    add_label "$I113" "$SM"
    add_label "$I113" "$CL"
    add_label "$I113" "$OC"
    add_label "$I113" "$RS"
    ;;

  9)
    echo "=== Module 9: Assessment ==="
    # CIA-44: M, high, cian, research
    add_label "$I44" "$M9"
    add_label "$I44" "$SM"
    add_label "$I44" "$CH"
    add_label "$I44" "$ON"
    add_label "$I44" "$RR"

    # CIA-67: M, medium, claude
    add_label "$I67" "$M9"
    add_label "$I67" "$SM"
    add_label "$I67" "$CM"
    add_label "$I67" "$OC"

    # CIA-69: L, medium, claude, spike
    add_label "$I69" "$M9"
    add_label "$I69" "$SL"
    add_label "$I69" "$CM"
    add_label "$I69" "$OC"
    add_label "$I69" "$RS"

    # CIA-93: XL, medium, collab, spike, research
    add_label "$I93" "$M9"
    add_label "$I93" "$SXL"
    add_label "$I93" "$CM"
    add_label "$I93" "$OB"
    add_label "$I93" "$RS"
    add_label "$I93" "$RR"

    # CIA-70: M, low, cian, research
    add_label "$I70" "$M9"
    add_label "$I70" "$SM"
    add_label "$I70" "$CL"
    add_label "$I70" "$ON"
    add_label "$I70" "$RR"
    ;;

  10)
    echo "=== Module 10: RAG ==="
    # CIA-104: M, medium, claude
    add_label "$I104" "$M10"
    add_label "$I104" "$SM"
    add_label "$I104" "$CM"
    add_label "$I104" "$OC"

    # CIA-105: M, medium, collab, spike, cost
    add_label "$I105" "$M10"
    add_label "$I105" "$SM"
    add_label "$I105" "$CM"
    add_label "$I105" "$OB"
    add_label "$I105" "$RS"
    add_label "$I105" "$RC"

    # CIA-96: M, low, collab, external
    add_label "$I96" "$M10"
    add_label "$I96" "$SM"
    add_label "$I96" "$CL"
    add_label "$I96" "$OB"
    add_label "$I96" "$RE"

    # CIA-98: M, low, collab, research
    add_label "$I98" "$M10"
    add_label "$I98" "$SM"
    add_label "$I98" "$CL"
    add_label "$I98" "$OB"
    add_label "$I98" "$RR"
    ;;

  11)
    echo "=== Module 11: Core Features ==="
    # CIA-37: M, medium, claude
    add_label "$I37" "$M11"
    add_label "$I37" "$SM"
    add_label "$I37" "$CM"
    add_label "$I37" "$OC"

    # CIA-32: S, low, claude
    add_label "$I32" "$M11"
    add_label "$I32" "$SS"
    add_label "$I32" "$CL"
    add_label "$I32" "$OC"

    # CIA-33: S, low, claude
    add_label "$I33" "$M11"
    add_label "$I33" "$SS"
    add_label "$I33" "$CL"
    add_label "$I33" "$OC"

    # CIA-34: M, medium, claude
    add_label "$I34" "$M11"
    add_label "$I34" "$SM"
    add_label "$I34" "$CM"
    add_label "$I34" "$OC"

    # CIA-31: S, low, claude
    add_label "$I31" "$M11"
    add_label "$I31" "$SS"
    add_label "$I31" "$CL"
    add_label "$I31" "$OC"

    # CIA-15: M, medium, cian, research
    add_label "$I15" "$M11"
    add_label "$I15" "$SM"
    add_label "$I15" "$CM"
    add_label "$I15" "$ON"
    add_label "$I15" "$RR"

    # CIA-16: M, medium, cian, research
    add_label "$I16" "$M11"
    add_label "$I16" "$SM"
    add_label "$I16" "$CM"
    add_label "$I16" "$ON"
    add_label "$I16" "$RR"
    ;;

  12)
    echo "=== Module 12: Clinical & Ethics ==="
    # CIA-45: XL, critical, cian, research
    add_label "$I45" "$M12"
    add_label "$I45" "$SXL"
    add_label "$I45" "$CC"
    add_label "$I45" "$ON"
    add_label "$I45" "$RR"

    # CIA-75: L, high, collab, research
    add_label "$I75" "$M12"
    add_label "$I75" "$SL"
    add_label "$I75" "$CH"
    add_label "$I75" "$OB"
    add_label "$I75" "$RR"

    # CIA-46: M, medium, cian, research
    add_label "$I46" "$M12"
    add_label "$I46" "$SM"
    add_label "$I46" "$CM"
    add_label "$I46" "$ON"
    add_label "$I46" "$RR"

    # CIA-86: L, medium, collab, research
    add_label "$I86" "$M12"
    add_label "$I86" "$SL"
    add_label "$I86" "$CM"
    add_label "$I86" "$OB"
    add_label "$I86" "$RR"

    # CIA-72: L, medium, claude
    add_label "$I72" "$M12"
    add_label "$I72" "$SL"
    add_label "$I72" "$CM"
    add_label "$I72" "$OC"
    ;;

  academic)
    echo "=== Academic Track ==="
    # CIA-41: M, cian
    add_label "$I41" "$MA"
    add_label "$I41" "$SM"
    add_label "$I41" "$ON"

    # CIA-42: M, cian
    add_label "$I42" "$MA"
    add_label "$I42" "$SM"
    add_label "$I42" "$ON"

    # CIA-43: L, cian
    add_label "$I43" "$MA"
    add_label "$I43" "$SL"
    add_label "$I43" "$ON"
    ;;

  deferred)
    echo "=== Deferred ==="
    # CIA-35: S
    add_label "$I35" "$MD"
    add_label "$I35" "$SS"

    # CIA-38: S
    add_label "$I38" "$MD"
    add_label "$I38" "$SS"

    # CIA-39: M
    add_label "$I39" "$MD"
    add_label "$I39" "$SM"

    # CIA-40: M
    add_label "$I40" "$MD"
    add_label "$I40" "$SM"

    # CIA-62: M
    add_label "$I62" "$MD"
    add_label "$I62" "$SM"

    # CIA-65: M
    add_label "$I65" "$MD"
    add_label "$I65" "$SM"

    # CIA-97: L
    add_label "$I97" "$MD"
    add_label "$I97" "$SL"

    # CIA-107: S
    add_label "$I107" "$MD"
    add_label "$I107" "$SS"

    # CIA-108: M
    add_label "$I108" "$MD"
    add_label "$I108" "$SM"

    # CIA-109: M
    add_label "$I109" "$MD"
    add_label "$I109" "$SM"
    ;;

  all)
    echo "Running all modules..."
    $0 2
    $0 3
    $0 4
    $0 5
    $0 6
    $0 7
    $0 8
    $0 9
    $0 10
    $0 11
    $0 12
    $0 academic
    $0 deferred
    echo "All modules done!"
    ;;

  *)
    echo "Usage: $0 <module>"
    echo "Modules: 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, academic, deferred, all"
    echo "Note: Module 1 already applied separately"
    exit 1
    ;;
esac

echo "Done!"
