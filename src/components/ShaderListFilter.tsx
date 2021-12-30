import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { useEffect, useState } from "react";

import { MeshType, Shader, StringFromMeshType } from "../objects/Shader";

interface ShaderListFilterProps {
  allShaders: Array<Shader>;
  updateDisplayedShaders: (shaders: Array<Shader>) => void;
  includeVisibilityFilter?: boolean;
}

const ShaderListFilter = ({
  allShaders,
  updateDisplayedShaders,
  includeVisibilityFilter = false,
}: ShaderListFilterProps) => {
  const [searchString, setSearchString] = useState<null | string>(null);
  const [meshFilter, setMeshFilter] = useState("All");
  const [visibilityFilter, setVisibilityFilter] = useState("All");

  const toOption = (optionString: string) => {
    return (
      <MenuItem key={optionString} value={optionString}>
        {optionString}
      </MenuItem>
    );
  };

  const visibilityOptions = ["All", "Public", "Private"].map(toOption);
  const meshOptions = [toOption("All")].concat(
    Object.values(MeshType).map(toOption)
  );

  useEffect(() => {
    const filteredShaders = allShaders.filter((shader) => {
      if (
        searchString &&
        !shader.title.toLowerCase().includes(searchString.toLowerCase())
      ) {
        return false;
      }
      if (
        meshFilter != "All" &&
        meshFilter != StringFromMeshType(shader.meshType)
      ) {
        return false;
      }
      if (includeVisibilityFilter && visibilityFilter != "All") {
        if (shader.isPublic && visibilityFilter == "Private") {
          return false;
        } else if (!shader.isPublic && visibilityFilter == "Public") {
          return false;
        }
      }
      return true;
    });
    updateDisplayedShaders(filteredShaders);
  }, [searchString, meshFilter, visibilityFilter]);

  return (
    <Stack direction="row" spacing={4} alignItems="flex-end">
      <TextField
        id="search"
        label="Filter by string"
        type="text"
        variant="standard"
        onChange={(name) => setSearchString(name.target.value)}
        style={{ minWidth: "15%" }}
      />
      <TextField
        id="meshFilter"
        select
        label="Filter by mesh"
        value={meshFilter}
        onChange={(name) => setMeshFilter(name.target.value)}
        style={{ minWidth: "15vh" }}
        SelectProps={{ MenuProps: { disableScrollLock: true } }}
      >
        {meshOptions}
      </TextField>
      {includeVisibilityFilter ? (
        <TextField
          id="visibilityFilter"
          select
          label="Filter by visibilty"
          value={visibilityFilter}
          onChange={(name) => setVisibilityFilter(name.target.value)}
          style={{ minWidth: "15vh" }}
          SelectProps={{ MenuProps: { disableScrollLock: true } }}
        >
          {visibilityOptions}
        </TextField>
      ) : (
        <></>
      )}
    </Stack>
  );
};

export default ShaderListFilter;
