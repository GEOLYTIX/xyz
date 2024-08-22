SELECT  
ARRAY[json_build_object('data', ARRAY[1, %{id}, 2, 2*%{id}])] AS datasets,
ARRAY['A', 'B', 'C', 'D'] AS labels